import { useEffect, useRef } from 'react'
import { Icon } from '../atoms/Icon'

export type ClubInformationTopic = 'club' | 'rules' | 'privacy'
const content: Record<ClubInformationTopic, { title: string; paragraphs: string[] }> = {
  club: { title: 'Bienvenido a Caracol Club', paragraphs: ['Un club de carreras imaginarias, pequeñas victorias y grandes dosis de paciencia.', 'Las carreras y las estadísticas son simuladas. No se ejecutan carreras ni apuestas reales.'] },
  rules: { title: 'Las reglas de nuestro club', paragraphs: ['Esta es una experiencia de demostración. El saldo empieza en $0 y todos los pagos y datos de tarjeta deben ser ficticios.', 'No se apuesta dinero real ni se utilizan animales. Nuestro único requisito: disfrutar del recorrido sin prisas.'] },
  privacy: { title: 'Tu cuenta, en este navegador', paragraphs: ['Guardamos tu nombre, correo, saldo y un hash de tu contraseña en LocalStorage. La contraseña original no se conserva.', 'Tu sesión se guarda en LocalStorage y permanece activa al recargar la página o volver a abrir el navegador, hasta que cierres sesión o borres los datos de la aplicación. Cerrar sesión conserva tu cuenta para que puedas volver a entrar.', 'La cuenta pertenece a este navegador y a esta dirección de la aplicación. Si borras sus datos de almacenamiento, se perderá. Usa una contraseña exclusiva para esta demostración.'] },
}
export function ClubInformation({ topic, onClose }: { topic: ClubInformationTopic; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { if (ref.current && !ref.current.open) ref.current.showModal() }, [])
  return <dialog ref={ref} className="information-dialog" onCancel={onClose}>
    <div className="information-heading"><span className="eyebrow">CARACOL CLUB</span><button type="button" onClick={onClose} aria-label="Cerrar información"><Icon name="close" /></button></div>
    <h2>{content[topic].title}</h2>{content[topic].paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
    <button type="button" className="secondary-button" onClick={onClose}>Entendido<Icon name="check" /></button>
  </dialog>
}
