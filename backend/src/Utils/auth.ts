import bcrypt from "bcrypt"

export const HashPassword = async(Passwd:string)=>{
    const salt =  await bcrypt.genSalt(10)
    return await bcrypt.hash(Passwd,salt)
}

export const CheckPassword = async(Passwd:string, Hash:string)=>{
    return await bcrypt.compare(Passwd,Hash)
}