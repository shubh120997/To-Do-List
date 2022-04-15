const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-shubham:Shub1997%40@cluster0.b7uqm.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const day = date.getDate();

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const Item = mongoose.model("Item", itemsSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItem) {
    res.render("list", {
      listTitle: day,
      newListItems: foundItem
    });
  });
});

app.post("/", function(req, res) {

  const newItemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
    });
    res.redirect("/" + listName);
  }



});

app.post("/delete", function(req, res) {
  const deleteItemId = req.body.deleteItem;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(deleteItemId, function(err) {
      if (!err) {
        console.log("Successfully deleted item");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: deleteItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customeListName", function(req, res) {
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({
    name: customeListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create new list
        const list = new List({
          name: customeListName
        });
        list.save();
        res.redirect("/" + customeListName);
      } else {
        //show existing listTitle
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
