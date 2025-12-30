import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { getSupabase } from "@/lib/supabaseClient";

// Form schema for 25+ Priority booking
const priorityBookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  bookingDate: z.date({
    required_error: "Please select a date",
  }),
  ticketQuantity: z.string().min(1, "Please enter number of tickets").refine(
    (val) => parseInt(val) > 0,
    "Must be at least 1 ticket"
  ),
  specialRequests: z.string().optional(),
});

type PriorityBookingFormValues = z.infer<typeof priorityBookingSchema>;

interface PriorityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityBookingModal = ({ isOpen, onClose }: PriorityBookingModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const form = useForm<PriorityBookingFormValues>({
    resolver: zodResolver(priorityBookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      ticketQuantity: "1",
      specialRequests: "",
    },
  });

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      form.setValue("bookingDate", date);
    }
  };

  const onSubmit = async (data: PriorityBookingFormValues) => {
    setIsSubmitting(true);
    try {
      const supabase = getSupabase();
      
      const ticketQty = parseInt(data.ticketQuantity);
      // 25+ Priority tickets are typically $20-30 per person
      const costPerTicket = 25.0;
      const totalAmount = ticketQty * costPerTicket;

      // Create the booking for VIP tickets (25+ Priority)
      const { error } = await supabase.from("bookings").insert({
        venue: "hippie",
        booking_type: "vip_tickets",
        booking_date: format(data.bookingDate, "yyyy-MM-dd"),
        start_time: "23:00", // 25+ Priority starts at 11 PM
        end_time: "05:00", // Until 5 AM
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        ticket_quantity: ticketQty,
        cost_per_ticket: costPerTicket,
        total_amount: totalAmount,
        status: "pending",
        special_requests: data.specialRequests || null,
      });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to confirm your 25+ Priority booking.",
      });

      // Reset form and close modal
      form.reset();
      setSelectedDate(undefined);
      onClose();
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto bg-hippie-teal border-hippie-gold">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-hippie-gold uppercase tracking-wide">
            Book 25+ Priority Entry
          </DialogTitle>
          <DialogDescription className="text-hippie-white/70">
            Skip the queue with Priority Entry. Disco from 11 'til late, curated for a 25+ crowd.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-hippie-gold uppercase">Your Details</h3>
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hippie-white">Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        {...field} 
                        className="bg-hippie-teal-dark border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hippie-white">Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                        className="bg-hippie-teal-dark border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hippie-white">Phone *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="0400 000 000" 
                        {...field} 
                        className="bg-hippie-teal-dark border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-hippie-gold uppercase">Booking Details</h3>
              
              <FormField
                control={form.control}
                name="bookingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-hippie-white">Date *</FormLabel>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        // Only allow Saturdays (day 6) and dates in the future
                        return date < new Date() || date.getDay() !== 6;
                      }}
                      className="rounded-md border border-hippie-white/20 bg-hippie-teal-dark text-hippie-white"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ticketQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-hippie-white">Number of Tickets *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="2" 
                        {...field} 
                        className="bg-hippie-teal-dark border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                      />
                    </FormControl>
                    <FormDescription className="text-hippie-white/60">
                      How many people need Priority Entry? ($25 per person)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Show estimated total */}
              {form.watch("ticketQuantity") && parseInt(form.watch("ticketQuantity")) > 0 && (
                <div className="p-4 rounded-lg bg-hippie-gold/10 border border-hippie-gold/30">
                  <p className="text-hippie-white font-body">
                    <span className="text-hippie-gold font-semibold">Estimated Total:</span>{" "}
                    ${(parseInt(form.watch("ticketQuantity")) * 25).toFixed(2)}
                  </p>
                  <p className="text-hippie-white/60 text-sm mt-1">
                    Final price will be confirmed via email
                  </p>
                </div>
              )}
            </div>

            {/* Special Requests */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-hippie-white">Special Requests (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Any special requests or notes?" 
                      {...field} 
                      className="bg-hippie-teal-dark border-hippie-white/20 text-hippie-white placeholder:text-hippie-white/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-10 px-4 py-2 rounded-md font-medium border-2 border-hippie-white bg-transparent text-hippie-white hover:bg-hippie-white hover:text-hippie-teal transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 hippie-btn-primary"
              >
                {isSubmitting ? "Submitting..." : "Submit Booking"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

