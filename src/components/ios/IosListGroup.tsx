import type { PropsWithChildren, ReactNode } from 'react';
import './IosListGroup.css';

interface IosListGroupProps {
  header?: string;
  footer?: ReactNode;
}

/**
 * Grupo de linhas arredondado estilo iOS Ajustes/Listas — fundo elevado,
 * cabeçalho em caixa alta opcional, rodapé opcional (nota/explicação).
 * Reutilizado por Ajustes, Mensagens, Notificações, Calendário, Abastecer
 * e Descansar e Diário de Bordo (Fase 7).
 */
export function IosListGroup({ header, footer, children }: PropsWithChildren<IosListGroupProps>) {
  return (
    <div className="ios-list-group">
      {header && <div className="ios-list-group__header ios-caption-strong">{header}</div>}
      <div className="ios-list-group__body">{children}</div>
      {footer && <div className="ios-list-group__footer ios-footnote">{footer}</div>}
    </div>
  );
}

interface IosListRowProps {
  icon?: ReactNode;
  iconBg?: string;
  label: string;
  /** Segunda linha opcional (ex.: pré-visualização de mensagem/notificação). */
  sublabel?: string;
  value?: string;
  chevron?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export function IosListRow({
  icon,
  iconBg = 'var(--ios-gray)',
  label,
  sublabel,
  value,
  chevron,
  trailing,
  onClick,
  destructive,
  disabled,
}: IosListRowProps) {
  // `trailing` pode conter seu próprio controle interativo (toggle, botão
  // de remover) — por isso a parte clicável vira um <button> interno, nunca
  // o <div> da linha inteira, evitando <button> aninhado em <button> (HTML
  // inválido/erro de hidratação).
  const content = (
    <>
      {icon && (
        <span className="ios-list-row__icon" style={{ background: iconBg }}>
          {icon}
        </span>
      )}
      <span className="ios-list-row__text">
        <span className={`ios-list-row__label${destructive ? ' is-destructive' : ''}`}>{label}</span>
        {sublabel && <span className="ios-list-row__sublabel">{sublabel}</span>}
      </span>
      {value && <span className="ios-list-row__value">{value}</span>}
      {chevron && (
        <svg className="ios-list-row__chevron" viewBox="0 0 8 14" width="8" height="14" aria-hidden="true">
          <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );

  return (
    <div className={`ios-list-row${sublabel ? ' has-sublabel' : ''}${disabled ? ' is-disabled' : ''}`}>
      {onClick ? (
        <button
          type="button"
          className="ios-list-row__hit is-interactive"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
        >
          {content}
        </button>
      ) : (
        <div className="ios-list-row__hit">{content}</div>
      )}
      {trailing}
    </div>
  );
}
