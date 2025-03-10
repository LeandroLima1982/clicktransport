
export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800';
    case 'inactive': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const translateStatus = (status: string) => {
  const statusMap: {[key: string]: string} = {
    'active': 'Ativo',
    'maintenance': 'Em manutenção',
    'inactive': 'Inativo'
  };
  return statusMap[status] || status;
};
