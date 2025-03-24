
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertTriangle, Check, Edit, Trash, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface VehicleCategory {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
  pricePerKm: number;
  updated_at?: string;
}

// Define the raw data structure from Supabase
interface VehicleRateRaw {
  id: string;
  name: string;
  capacity: number; // Added the capacity field from the migration
  baseprice: number;
  priceperkm: number;
  updated_at: string;
  created_at: string;
}

const VehicleCategoriesSettings: React.FC = () => {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const [editForm, setEditForm] = useState<VehicleCategory>({
    id: '',
    name: '',
    capacity: 4,
    basePrice: 0,
    pricePerKm: 0
  });

  useEffect(() => {
    loadVehicleCategories();
  }, []);

  const loadVehicleCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_rates')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Type the raw data correctly
        const rawData = data as VehicleRateRaw[];
        
        const formattedCategories: VehicleCategory[] = rawData.map(item => ({
          id: item.id,
          name: item.name,
          capacity: item.capacity || 4, // Use the capacity field, with fallback
          basePrice: Number(item.baseprice),
          pricePerKm: Number(item.priceperkm),
          updated_at: item.updated_at
        }));
        
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error loading vehicle categories:', error);
      toast.error('Erro ao carregar categorias de veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: VehicleCategory) => {
    setIsEditing(category.id);
    setEditForm(category);
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('vehicle_rates')
        .update({
          name: editForm.name,
          capacity: editForm.capacity,
          baseprice: editForm.basePrice,
          priceperkm: editForm.pricePerKm
        })
        .eq('id', editForm.id);
      
      if (error) throw error;
      
      toast.success('Categoria atualizada com sucesso');
      loadVehicleCategories();
      setIsEditing(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
    }
  };

  const handleAddNew = async () => {
    try {
      if (!editForm.id || !editForm.name) {
        toast.error('ID e nome são obrigatórios');
        return;
      }
      
      // Check if ID already exists
      const { data: existingCategory } = await supabase
        .from('vehicle_rates')
        .select('id')
        .eq('id', editForm.id)
        .single();
      
      if (existingCategory) {
        toast.error('Este ID já está em uso');
        return;
      }
      
      const { error } = await supabase
        .from('vehicle_rates')
        .insert({
          id: editForm.id,
          name: editForm.name,
          capacity: editForm.capacity || 4,
          baseprice: editForm.basePrice || 100,
          priceperkm: editForm.pricePerKm || 2.5
        });
      
      if (error) throw error;
      
      toast.success('Nova categoria adicionada com sucesso');
      loadVehicleCategories();
      setShowAddDialog(false);
      
      // Reset form
      setEditForm({
        id: '',
        name: '',
        capacity: 4,
        basePrice: 100,
        pricePerKm: 2.5
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      const { error } = await supabase
        .from('vehicle_rates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Categoria excluída com sucesso');
      loadVehicleCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert to number for numeric fields
    if (name === 'capacity' || name === 'basePrice' || name === 'pricePerKm') {
      setEditForm({
        ...editForm,
        [name]: Number(value)
      });
    } else {
      setEditForm({
        ...editForm,
        [name]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Categorias de Veículos</h2>
          <p className="text-muted-foreground">
            Gerencie os tipos de veículos disponíveis para reserva
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Categoria</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da nova categoria de veículo
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (código único)</Label>
                <Input
                  id="id"
                  name="id"
                  value={editForm.id}
                  onChange={handleInputChange}
                  placeholder="ex: sedan, suv, van"
                />
                <p className="text-xs text-muted-foreground">
                  Utilize um ID único e descritivo. Este valor não poderá ser alterado depois.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  placeholder="ex: Sedan Executivo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacidade (pessoas)</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={editForm.capacity}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="basePrice">Preço Base (R$)</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.basePrice}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerKm">Preço por Km (R$)</Label>
                <Input
                  id="pricePerKm"
                  name="pricePerKm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.pricePerKm}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddNew}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorias Disponíveis</CardTitle>
          <CardDescription>
            Gerencie as categorias de veículos, capacidade e preços
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-center">Capacidade</TableHead>
                  <TableHead className="text-center">Preço Base</TableHead>
                  <TableHead className="text-center">Preço/Km</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.id}</TableCell>
                    <TableCell>
                      {isEditing === category.id ? (
                        <Input 
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                        />
                      ) : (
                        category.name
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing === category.id ? (
                        <Input 
                          type="number"
                          name="capacity"
                          value={editForm.capacity}
                          onChange={handleInputChange}
                          min="1"
                          className="w-20 mx-auto text-center"
                        />
                      ) : (
                        category.capacity
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing === category.id ? (
                        <Input 
                          type="number"
                          name="basePrice"
                          value={editForm.basePrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-24 mx-auto text-center"
                        />
                      ) : (
                        `R$ ${category.basePrice.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing === category.id ? (
                        <Input 
                          type="number"
                          name="pricePerKm"
                          value={editForm.pricePerKm}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-24 mx-auto text-center"
                        />
                      ) : (
                        `R$ ${category.pricePerKm.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        {isEditing === category.id ? (
                          <>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSave}>
                              <Save className="h-4 w-4 mr-1" />
                              Salvar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(category.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!loading && categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma categoria encontrada.</p>
              <Button
                variant="link"
                onClick={() => setShowAddDialog(true)}
                className="mt-2"
              >
                Adicionar a primeira categoria
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehicleCategoriesSettings;
