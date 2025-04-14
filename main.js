import bcrypt from "bcryptjs";

const p = "EUyWrqs4yhfJhG?z2U&p";

const myhash = bcrypt.hashSync(p, 10);
console.log(myhash);

const match = bcrypt.compareSync(p, myhash);
console.log(match);

console.log(p.length);
