import User from "../models/User.js";

export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Benutzer existiert bereits." });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: "Registrierung erfolgreich!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Fehler bei der Registrierung.", error });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Benutzer nicht gefunden." });

    if (user.password !== password) {
      return res.status(401).json({ message: "Falsches Passwort." });
    }

    res.status(200).json({ message: "Login erfolgreich!", user });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Login.", error });
  }
};



export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden der Benutzer", error });
  }
};


