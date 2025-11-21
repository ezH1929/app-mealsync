"use client";

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChefHat, Truck, PackageCheck, Clock, Award, Sparkles, MapPin, Utensils, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

const steps = [
  { 
    id: 'preparing', 
    label: 'Order Accepted', 
    description: 'Kitchen received your order', 
    icon: CheckCircle2, 
    color: 'text-green-600', 
    bg: 'bg-green-100',
    subtext: 'Your order has been confirmed and accepted.'
  },
  { 
    id: 'preparing-food',
    label: 'Preparing Your Meal', 
    description: 'Our chefs are cooking with love', 
    icon: ChefHat, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100',
    subtext: 'Kitchen is busy preparing your delicious meal.'
  },
  { 
    id: 'out-for-delivery', 
    label: 'Out for Delivery', 
    description: 'Your food is on the way', 
    icon: Truck, 
    color: 'text-blue-600', 
    bg: 'bg-blue-100',
    subtext: 'Delivery person is bringing your order.'
  },
  { 
    id: 'delivered', 
    label: 'Delivered', 
    description: 'Enjoy your meal!', 
    icon: PackageCheck, 
    color: 'text-purple-600', 
    bg: 'bg-purple-100',
    subtext: 'Your order has been delivered successfully.'
  },
];

export function OrderTrackingModal({ isOpen, onClose, order }: OrderTrackingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isOpen || !order) return;

    const status = order.status || 'preparing';
    let targetStep = 0;
    
    // Map status to step index
    if (status === 'preparing') targetStep = 1; // Show "Preparing Your Meal"
    if (status === 'out-for-delivery') targetStep = 2;
    if (status === 'delivered') targetStep = 3;

    setCurrentStepIndex(targetStep);
    
    if (targetStep === 3) {
        setShowConfetti(true);
    }
  }, [isOpen, order, order?.status]); // Re-run when order status changes

  if (!order) return null;

  const currentStep = steps[currentStepIndex] || steps[0];
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-white border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
        {/* Animated Gradient Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 pb-16 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl"></div>
            </div>
            
            {/* Floating Icons */}
            <motion.div 
                className="absolute top-4 right-4 opacity-20"
                animate={{ rotate: 360, y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <Utensils size={80} />
            </motion.div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl inline-flex items-center gap-2">
                        <Clock className="h-6 w-6 text-white animate-pulse" />
                        <div>
                            <p className="text-[10px] font-medium opacity-80 uppercase tracking-wider">ETA</p>
                            <p className="text-lg font-bold leading-tight">{order.deliveryTime || '12:30 PM'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-yellow-400/90 text-yellow-900 px-3 py-1.5 rounded-full text-xs font-bold">
                        <Star size={12} fill="currentColor" />
                        <span>LIVE</span>
                    </div>
                </div>
                
                <h2 className="text-3xl font-heading font-bold mb-2">Order Tracking</h2>
                <p className="text-white/90 text-sm mb-1">Order #{order.id?.slice(-4).toUpperCase() || '1234'}</p>
                <p className="text-white/80 text-xs flex items-center gap-1">
                    <MapPin size={12} /> Delivering to {order.meetingId ? 'Meeting Room' : 'Office Desk'}
                </p>
            </div>
        </div>

        <div className="px-6 -mt-10 relative z-20 pb-8">
            {/* Main Status Card with Elevation */}
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-100 text-center relative overflow-hidden"
            >
                {/* Animated Background Circles */}
                <div className="absolute inset-0 opacity-5">
                    <motion.div 
                        className={cn("absolute top-1/2 left-1/2 w-40 h-40 rounded-full", currentStep.bg)}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ transform: 'translate(-50%, -50%)' }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep.id}
                        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="flex flex-col items-center relative z-10"
                    >
                        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mb-5 shadow-xl relative", currentStep.bg)}>
                            <currentStep.icon className={cn("h-12 w-12", currentStep.color)} strokeWidth={2.5} />
                            
                            {/* Pulse Ring */}
                            {currentStepIndex < 3 && (
                                <motion.div
                                    className={cn("absolute inset-0 rounded-full", currentStep.bg)}
                                    initial={{ scale: 1, opacity: 0.5 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </div>
                        
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStep.label}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-[280px]">{currentStep.subtext}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="mt-6 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
            </motion.div>

            {/* Vertical Timeline */}
            <div className="relative mb-8">
                 <div className="space-y-4">
                     {steps.map((step, index) => {
                         const isCompleted = index < currentStepIndex;
                         const isCurrent = index === currentStepIndex;
                         const isPending = index > currentStepIndex;

                         return (
                             <motion.div 
                                 key={step.id} 
                                 className="relative flex items-center gap-4"
                                 initial={{ x: -20, opacity: 0 }}
                                 animate={{ x: 0, opacity: 1 }}
                                 transition={{ delay: index * 0.1 }}
                             >
                                 <div className={cn(
                                     "relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shrink-0",
                                     isCompleted && "bg-green-500 border-green-500",
                                     isCurrent && "bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent shadow-lg scale-110",
                                     isPending && "bg-gray-100 border-gray-300"
                                 )}>
                                     {isCompleted && <CheckCircle2 size={20} className="text-white" />}
                                     {isCurrent && <step.icon size={20} className="text-white" />}
                                     {isPending && <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                                 </div>
                                 
                                 <div className={cn(
                                     "flex-1 p-3 rounded-xl transition-all duration-300",
                                     isCurrent && "bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200",
                                     (isCompleted || isPending) && "bg-gray-50"
                                 )}>
                                     <p className={cn(
                                         "text-sm font-bold transition-colors",
                                         isCurrent && "text-indigo-700",
                                         isCompleted && "text-gray-700",
                                         isPending && "text-gray-400"
                                     )}>{step.label}</p>
                                     {isCurrent && <p className="text-xs text-indigo-600 mt-0.5">{step.description}</p>}
                                 </div>
                             </motion.div>
                         )
                     })}
                 </div>
            </div>

            {/* Reward Card */}
            <AnimatePresence>
                {currentStepIndex === 3 && (
                    <motion.div 
                        initial={{ y: 30, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", bounce: 0.4 }}
                        className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-5 flex items-center gap-4 shadow-lg"
                    >
                         <motion.div 
                            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-md"
                            animate={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                         >
                            <Award size={28} />
                         </motion.div>
                         <div>
                             <h4 className="font-bold text-green-900 text-base flex items-center gap-2">
                                Order Completed! <Sparkles size={16} className="text-yellow-500" />
                             </h4>
                             <p className="text-xs text-green-700 font-medium mt-0.5">
                                +50 Green Credits earned! Enjoy your meal.
                             </p>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Footer Button */}
        <div className="p-5 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
             <Button 
                onClick={onClose} 
                className={cn(
                    "w-full h-12 rounded-2xl font-bold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                    currentStepIndex === 3 
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                )}
             >
                {currentStepIndex === 3 ? '⭐ Rate Your Meal' : 'Close Tracker'}
             </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
