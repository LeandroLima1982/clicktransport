
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Car, Eye, EyeOff } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DriverRegistrationFormProps {
  companyId: string;
  onSuccess?: () => void;
}

const DriverRegistrationForm: React.FC<DriverRegistrationFormProps> = ({ 
  companyId,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePassword = () => {
    // Generate a random password of 8 characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
    
    // Show the password after generating it
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Create the user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            email: formData.email,
            role: 'driver',
            full_name: formData.name
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Erro ao criar usuário');
      }
      
      // 2. Create the driver record in the drivers table with email field
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          name: formData.name,
          phone: formData.phone,
          license_number: formData.licenseNumber,
          company_id: companyId,
          user_id: authData.user.id,
          status: 'active',
          email: formData.email,
          is_password_changed: false
        });
      
      if (driverError) throw driverError;
      
      toast.success('Motorista cadastrado com sucesso!', {
        description: `O motorista agora pode fazer login usando as credenciais fornecidas. Senha provisória: ${formData.password}`
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        password: '',
        confirmPassword: ''
      });
      
      // Callback on success
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error('Error registering driver:', error);
      toast.error('Erro ao cadastrar motorista', {
        description: error.message || 'Ocorreu um erro ao processar o cadastro.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center">
          <Car className="mr-2 h-5 w-5" />
          Cadastrar Novo Motorista
        </CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Nome do motorista"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Este será o login do motorista no sistema
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número da CNH</Label>
            <Input
              id="licenseNumber"
              name="licenseNumber"
              placeholder="Número da CNH"
              value={formData.licenseNumber}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Senha Provisória</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={generatePassword}
              >
                Gerar Senha
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mínimo de 6 caracteres. O motorista usará esta senha no primeiro acesso.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Cadastrar Motorista
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DriverRegistrationForm;
