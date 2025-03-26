import { z } from "zod"

export const userSchema = z.object({
    name: z.string().min(1, 'string olacak'),
    age : z.number().min(0, 'sayi olacak'),
    email: z.string().email('gecerli email adresi giriniz')
})


export const userUpdateSchema = z.object({
    email: z.string().email('gecerli email adresi giriniz')
})