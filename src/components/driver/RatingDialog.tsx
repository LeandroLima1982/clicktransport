
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { ServiceOrder } from '@/types/serviceOrder';
import { submitRating } from '@/services/rating/ratingService';
import { toast } from 'sonner';
import { MessageSquare, ThumbsUp, Star } from 'lucide-react';

interface RatingDialogProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmitted?: () => void;
}

const RatingDialog: React.FC<RatingDialogProps> = ({ 
  order, 
  isOpen, 
  onClose,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!order) return null;

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    if (!order.id || !order.driver_id) {
      toast.error('Informações da corrida incompletas');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await submitRating({
        order_id: order.id,
        driver_id: order.driver_id,
        rating,
        feedback: feedback.trim() || undefined
      });

      if (success) {
        toast.success('Avaliação enviada com sucesso!', {
          description: 'Obrigado pelo seu feedback'
        });
        
        if (onRatingSubmitted) {
          onRatingSubmitted();
        }
        
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Avaliar Serviço
          </DialogTitle>
          <DialogDescription>
            Avalie sua experiência com o motorista nesta viagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Como você avalia o serviço?</div>
            <div className="flex justify-center py-2">
              <StarRating
                initialRating={rating}
                size="lg"
                onChange={setRating}
                className="gap-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Deixe um comentário (opcional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Compartilhe sua experiência..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitRating}
            disabled={rating === 0 || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">◌</span>
                Enviando...
              </>
            ) : (
              <>
                <ThumbsUp className="h-4 w-4" />
                Enviar Avaliação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
