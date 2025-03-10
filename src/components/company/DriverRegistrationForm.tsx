
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Car } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/main';

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
  const { user } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      // 2. Create the driver record in the drivers table
      const { error: driverError } = await supabase
        .from('drivers')
        .insert({
          name: formData.name,
          phone: formData.phone,
          license_number: formData.licenseNumber,
          company_id: companyId,
          user_id: authData.user.id,
          status: 'active'
        });
      
      if (driverError) throw driverError;
      
      toast.success('Motorista cadastrado com sucesso!', {
        description: 'O motorista agora pode fazer login usando as credenciais fornecidas.'
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Mínimo de 6 caracteres
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
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
