import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { GenericModal } from './genericModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

type Respondee = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

async function fetchRespondees(teamId: string): Promise<Respondee[]> {
  const response = await fetch(`/api/respondees?teamId=${teamId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch team members');
  }
  const data = await response.json();
  return data.respondees;
}

export function ViewMembersModal({ isOpen, onClose, teamId }: ViewMembersModalProps) {
  const queryClient = useQueryClient();
  const {
    data: respondees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['respondees', teamId],
    queryFn: () => fetchRespondees(teamId),
    enabled: isOpen && !!teamId,
  });

  async function deleteRespondee(respondeeId: string) {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    console.log('============================================');
    console.log('Deleting respondee', respondeeId);
    console.log('============================================');
    try {
      const response = await fetch(`/api/respondees/${respondeeId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete team member');
      }
      toast.success('Team member deleted successfully');
      void queryClient.invalidateQueries({ queryKey: ['respondees', teamId] });
    } catch (err: any) {
      toast.error(err.message || 'An unknown error occurred');
    }
  }

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Membros do time"
      description="Veja e gerencie os membros deste time."
    >
      {isLoading ? (
        <div className="p-4 text-center">Loading team members...</div>
      ) : error ? (
        <div className="p-4 text-center text-red-500">{(error as Error).message}</div>
      ) : respondees.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">No team members found.</div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {respondees.map((respondee) => (
              <Card key={respondee._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{respondee.name}</h3>
                    <p className="text-sm">{respondee.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Role: {respondee.role}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => void deleteRespondee(respondee._id)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </GenericModal>
  );
}
