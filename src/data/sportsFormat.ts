// Tradução/formatação de campos vindos literalmente da football-data.org
// (ver src/data/sportsApi.ts) — nunca reescreve nomes, placares ou datas,
// só rotula o status em português e formata hora/dia locais.
const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Agendado',
  TIMED: 'Agendado',
  IN_PLAY: 'Ao vivo',
  PAUSED: 'Intervalo',
  FINISHED: 'Encerrado',
  POSTPONED: 'Adiado',
  SUSPENDED: 'Suspenso',
  CANCELLED: 'Cancelado',
};

export function translateStatus(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function isLiveStatus(status: string): boolean {
  return status === 'IN_PLAY' || status === 'PAUSED';
}

export function formatMatchDate(utcDate: string): string {
  const d = new Date(utcDate);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
