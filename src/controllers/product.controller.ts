import Product from "../models/product.model";
import { type Request, type Response } from "express";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface productData {
  title: string;
  description: string;
  price: number;
  stock: number;
  color: string;
  category: string;
  images: string[];
  mainCategory: string;
  collectionName: string;
  subCollectionName: string;
  isPublished: boolean;
}

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products: productData[] = await Product.find();

    if (!products || products.length === 0) {
      res.status(404).json({ message: "Keine Produkte gefunden." });
      return;
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Produkte konnten nicht geladen werden.", error });
  }
};

/**
 *
 * @warning This Route must be protected, in Production everyone can create a product
 */
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product: productData = req.body;
    const salesperson = req.user?.id;
    console.log("Salesperson ID: ", req.user?.id);

    const newProduct = new Product({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      color: product.color,
      category: product.category,
      images: product.images,
      mainCategory: product.mainCategory,
      collectionName: product.collectionName,
      subCollectionName: product.subCollectionName,
      salesperson: salesperson,
      isPublished: product.isPublished,
    });

    const savedProduct = await newProduct.save();
    if (!savedProduct) {
      res.status(400).json({ message: "Produkt konnte nicht gespeichert werden." });
      return;
    }
    res.status(201).json({ message: "Neues Produkt erstellt", savedProduct });
  } catch (error) {
    res.status(500).json({ message: "Produkt konnte nicht erstellt werden.", error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product: productData = req.body.product;
    res.status(200).json({ message: "Product found by id: ", product });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden des Produkts.", error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const exsitingProduct = await Product.findById(id);

    if (exsitingProduct?.salesperson.toString() !== req.user?.id) {
      res.status(403).json({ message: "Sie sind nicht berechtigt, dieses Produkt zu aktualisieren." });
      return;
    }
    await Product.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({ message: "Produkt wurde aktualisiert.", product: req.body });
  } catch (error) {
    res.status(500).json({ message: "Produkt konnte nicht aktualisiert werden.", error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({ message: "Produkt ID ist erforderlich." });
      return;
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Produkt nicht gefunden." });
      return;
    }

    res.status(200).json({ message: "Produkt wurde gelöscht." });
  } catch (error) {
    res.status(500).json({ message: "Produkt konnte nicht gelöscht werden.", error });
  }
};
