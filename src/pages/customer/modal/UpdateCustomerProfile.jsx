import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form"

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  fullName: z.string().min(1, { message: "fullName is required" })
})

export const UpdateCustomerProfile = ({ data }) => {
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: data.email,
      fullName: data.fullName,
    }
  })

  const onSubmit = (values) => {
    if(values.email === data.email && values.fullName === data.fullName) return
    console.log("Login values:", values)
  }

  useEffect(() => {
    if (!open) {
      form.reset({ email: data.email, fullName: data.fullName });
    } else {
      form.setValue("email", data.email);
      form.setValue("fullName", data.fullName);
    }
  }, [open, form, data])

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button>Update Profile</Button>
        </DialogTrigger>
        <DialogContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or Username</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fullname</FormLabel>
                    <FormControl>
                      <Input type="fullName" placeholder="Enter fullName" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Login
              </Button>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}

                </p>
              </div>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
