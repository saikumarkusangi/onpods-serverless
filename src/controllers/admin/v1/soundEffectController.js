import mongoose from "mongoose";
import Category from "../../../models/soundEffectModel.js";


export const addNewCategory = async (req, res) => {
    try {
      const { name } = req.body;
      const newCategory = new Category({ category:name });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  export const addNewEffect = async (req, res) => {
    try {
      const { name, sound, icon } = req.body;
      const { id } = req.params; 
  
      const category = await Category.findById(id);
      
  
    
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
    
      const newData = {
       id:new mongoose.Types.ObjectId().toString(),
        name,
        sound,
        icon
      };
  
    
      category.data.push(newData);
  

      await category.save();
  
      // Send the updated category as the response
      res.status(200).json(category);
    }
      catch (error) {
        // Handle errors
        res.status(500).json({ message: error.message });
      }
    };

  export const deleteData = async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      await category.remove();
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  

  export const getAllData = async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  