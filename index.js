import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

//__________________connect to DB_____________________________
const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "permalist",
  password : "", // insert password
  port : 5432,
})
db.connect()   // DB connected.
//________________________________________________________________

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [] // required format --------{ id: 1, title: "Buy milk" }, 

async function pullItems(){
  //______________get list of itmes form DB ________________________
let result = await db.query("SELECT * FROM items ORDER BY id")
let data = result.rows   //  { id: 1, title: 'Buy milk' },
console.log(data)
data.forEach((item) => {
  items.push(item)
})
return items
}

//____________--Render the home page________________________________
app.get("/",async (req, res) => {
  items = await pullItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

//_______________--Add item________________________________________
app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  console.log (item)
  await db.query("INSERT INTO items (title) values ($1)",
  [item])
  //items.push({ title: item }); no need to edit array here we have a function for that
  items = []   //empty the array so we can populate with DB data
  res.redirect("/");
});

//________________--edit route______________________________________
app.post("/edit",async (req, res) => {
  const editID = req.body["updatedItemId"];
  const updatedTitle = req.body["updatedItemTitle"]
  console.log(editID) //investigate what we doing on B end
  console.log(updatedTitle) 

  await db.query("UPDATE items SET title = $1 WHERE id = $2;", 
  [updatedTitle,editID])
  items = []   //empty the array so we can populate with DB data
  res.redirect("/");  

});

//___________________--delete route___________________________________
app.post("/delete", async (req, res) => {
  const deleteID = req.body["deleteItemId"];
  console.log(deleteID) //investigate what we doing on B end
  await db.query("DELETE FROM items WHERE id = $1", 
  [deleteID]) //remove entry from DB
  items = []   //empty the array so we can populate with DB data
  res.redirect("/");
});

//________________--run mode route_____________________________________
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
