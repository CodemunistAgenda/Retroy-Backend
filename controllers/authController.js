import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { generateToken } from "../utils/jwt.js";
import "dotenv/config";
import fs from "fs";
import path from "path";


export const registerUser =async (req, res) => {
   };


export const loginUser =async (req, res) => {
 
};

export const getUserProfile =async (req, res) => {

};

export const getUsers =async (req, res) => {

};


export const getUserById =async (req, res) => {
};

export const updateUser =async (req, res) => {
};


export const deleteUser =async (req, res) => {
};



export const changePassword =async (req, res) => {
};

export const toggleUserStatus =async (req, res) => {
};



export const updateUserRole = async (req, res) => {
};


export const updateUserProfile = async (req, res) => {
};




export const updateProfileImage = async (req, res) => {
};







