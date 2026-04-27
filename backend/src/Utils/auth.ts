import bcrypt from "bcrypt"

export const HashPassword = async(passwd:string)=>{
    const salt =  await bcrypt.genSalt(10)
    return await bcrypt.hash(passwd,salt)
}

export const CheckPassword = async(passwd:string, Hash:string)=>{
    return await bcrypt.compare(passwd,Hash)
}