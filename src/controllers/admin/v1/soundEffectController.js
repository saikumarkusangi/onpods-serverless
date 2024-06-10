import Category from "../../../models/soundEffectModel.js";


export const addData = async (req, res) => {
    try {
      const { category, data } = req.body;
      const newCategory = new Category({ category, data });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
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
  