import Product from "../models/product.model";
import { Request, Response } from "express";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "❌ Produkt konnte nicht erstellt werden.", error });
  }
};

export const getAllProducts = async (_: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "❌ Produkte konnten nicht geladen werden.", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "❌ Produkt nicht gefunden." });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "❌ Fehler beim Laden des Produkts.", error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "❌ Produkt nicht gefunden." });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "❌ Produkt konnte nicht aktualisiert werden.", error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "❌ Produkt nicht gefunden." });
    res.status(200).json({ message: "✅ Produkt wurde gelöscht." });
  } catch (error) {
    res.status(500).json({ message: "❌ Produkt konnte nicht gelöscht werden.", error });
  }
};
