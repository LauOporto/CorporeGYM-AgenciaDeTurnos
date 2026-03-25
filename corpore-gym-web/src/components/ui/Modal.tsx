import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onConfirm, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  variant = 'primary', 
  isLoading 
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        {title && (
           <CardHeader className="border-b border-gray-100 bg-gray-50/50">
             <CardTitle className={`text-xl text-center ${variant === 'danger' ? 'text-red-600' : 'text-gray-900'}`}>{title}</CardTitle>
           </CardHeader>
        )}
        <CardContent className="p-6">
          <div className="text-gray-600 text-center space-y-4 mb-6">
            {children}
          </div>
          {onConfirm ? (
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button variant="ghost" className="w-full sm:w-1/2" onClick={onClose} disabled={isLoading}>
                {cancelText}
              </Button>
              <Button 
                variant={variant} 
                className="w-full sm:w-1/2 font-bold"
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmText}
              </Button>
            </div>
          ) : (
            <Button 
              variant={variant} 
              className="w-full font-bold" 
              onClick={onClose}
            >
                {confirmText || 'Entendido'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
