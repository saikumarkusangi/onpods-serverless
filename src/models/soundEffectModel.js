import { Schema, model } from 'mongoose';


const dataSchema = new Schema({
  id: String,
  icon: String,
  name: String,
  sound: String
});

const categorySchema = new Schema({
  category: String,
  data: [dataSchema]
});

const Category = model('Category', categorySchema);

export default Category;
