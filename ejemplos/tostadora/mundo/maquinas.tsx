import { useMemo } from "react";
import { Color, ExtrudeGeometry, Path, Shape } from "three";
import { Banda, Caja, Cil, Entra, limite, mat, PAL, tramo, useT, type V3 } from "../../piezas/base";
import { Cascada, Corriente, Disco, Humo, Monton, TOSTADO, VERDE } from "../../piezas/granos";
import { PLANTA } from "./tiempos";

const VIA_Z = -10;
const ROASTER: V3 = [-2.6, 0, VIA_Z];
const DRUM_Y = 3.4;
const FRENTE = -7.9;
const BANDEJA: V3 = [-2.6, 0, -4];
export const EMPACADORA: V3 = [9, 0, -4];

const B1A: V3 = [-12.4, 0.95, VIA_Z];
const B1B: V3 = [-3.9, 7.6, VIA_Z];
const B2A: V3 = [0.2, 1.15, -4];
const B2B: V3 = [7.9, 7.8, -4];

const RUTA_DESCARGA: V3[] = [[-13.8, 2, VIA_Z], [-13.3, 1.7, VIA_Z], [-12.9, 1.1, VIA_Z], [-12.6, 0.8, VIA_Z]];
const RUTA_B1: V3[] = [[B1A[0], B1A[1] + 0.12, VIA_Z], [B1B[0], B1B[1] + 0.12, VIA_Z], [-3.2, 7.75, VIA_Z], [-2.7, 6.9, VIA_Z]];
const RUTA_CAIDA: V3[] = [[-2.6, 1.95, FRENTE + 0.1], [-2.6, 1.9, -7.1], [-2.6, 1.75, -6.5], [-2.6, 1.45, -5.9]];
const RUTA_B2: V3[] = [[B2A[0] - 0.3, 1.5, -4], [B2A[0], B2A[1] + 0.14, -4], [B2B[0], B2B[1] + 0.14, -4], [8.5, 7.95, -4], [9, 7.2, -4]];

/** Volquete que entra en reversa, levanta la tolva y vuelve a salir. */
export const Camion: React.FC = () => {
  const t = useT();
  const entra = tramo(t, PLANTA.camionLlega);
  const sale = tramo(t, PLANTA.camionSale);
  const x = -38 + entra * 24.2 - sale * 30;
  const giro = tramo(t, PLANTA.volteo) * (1 - tramo(t, PLANTA.volteoBaja)) * 0.72;
  const nivel = 1 - tramo(t, PLANTA.descarga);
  const rueda = -x * 1.6;
  return (
    <group position={[x, 0, VIA_Z]} visible={t > PLANTA.camionLlega[0] && t < PLANTA.camionSale[1]}>
      <Caja s={[6.1, 0.3, 1.5]} p={[-3.05, 0.72, 0]} c={PAL.grafitoSuave} />
      {[-0.8, -2.0, -5.0].map((rx) =>
        [-0.82, 0.82].map((rz) => <Cil key={`${rx}${rz}`} r={0.42} h={0.36} lados={24} p={[rx, 0.42, rz]} rot={[Math.PI / 2, 0, rueda]} c={PAL.grafito} />),
      )}
      <group position={[-5.1, 0, 0]}>
        <Caja s={[1.8, 1.8, 2]} p={[-0.2, 1.75, 0]} c={PAL.blanco} r={0.28} />
        <Caja s={[0.5, 0.8, 1.84]} p={[-0.85, 2.05, 0]} c={PAL.grafito} r={0.1} />
        <Caja s={[1.84, 0.16, 2.04]} p={[-0.2, 1.25, 0]} c={PAL.acento} r={0.05} />
        <Caja s={[0.82, 0.6, 2.03]} p={[-0.32, 2.15, 0]} c={PAL.grafito} r={0.06} />
        <Caja s={[0.08, 1.2, 1.3]} p={[0.72, 1.8, 0]} c={PAL.grafitoSuave} r={0.03} />
      </group>
      <group position={[0, 0.98, 0]} rotation={[0, 0, -giro]}>
        <group position={[-1.95, 0.72, 0]}>
          <Caja s={[3.9, 0.14, 2]} p={[0, -0.63, 0]} c={PAL.acento} />
          <Caja s={[3.9, 1.3, 0.12]} p={[0, 0, 0.98]} c={PAL.acento} />
          <Caja s={[3.9, 1.3, 0.12]} p={[0, 0, -0.98]} c={PAL.acento} />
          <Caja s={[0.12, 1.3, 2]} p={[-1.92, 0, 0]} c={PAL.acento} />
          <Monton n={260} centro={[0, 0.2, 0]} radio={[1.75, 0.65, 0.84]} nivel={Math.max(0.05, nivel)} tinte={VERDE} />
        </group>
      </group>
    </group>
  );
};

/** Foso de recepción y primera banda. */
export const Recepcion: React.FC = () => {
  const t = useT();
  return (
    <>
      <Caja s={[3.2, 0.5, 3]} p={[-12.7, 0.25, VIA_Z]} c={PAL.hueso} />
      <Caja s={[2.6, 0.06, 2.4]} p={[-12.7, 0.5, VIA_Z]} c={PAL.grafito} r={0.02} />
      <Monton n={140} centro={[-12.7, 0.5, VIA_Z]} radio={[1.1, 0.45, 1.05]} nivel={limite((t - PLANTA.descarga[0]) / 1)} tinte={VERDE} />
      <Banda a={B1A} b={B1B} desde={PLANTA.banda1} vel={3.6} />
      <Corriente n={70} ruta={RUTA_DESCARGA} T={0.42} desde={PLANTA.descarga[0]} hasta={PLANTA.descarga[1]} tinte={VERDE} ancho={1.5} alto={0.4} />
      <Corriente n={330} ruta={RUTA_B1} T={3} desde={PLANTA.banda1} tinte={VERDE} />
    </>
  );
};

/** Cuerpo de la tostadora: un bloque extruido con el agujero real del tambor para poder mirar dentro. */
const useCuerpo = () =>
  useMemo(() => {
    const [w, h, r] = [4.4, 5, 0.4];
    const s = new Shape();
    s.moveTo(-w / 2 + r, 0);
    s.lineTo(w / 2 - r, 0);
    s.quadraticCurveTo(w / 2, 0, w / 2, r);
    s.lineTo(w / 2, h - r);
    s.quadraticCurveTo(w / 2, h, w / 2 - r, h);
    s.lineTo(-w / 2 + r, h);
    s.quadraticCurveTo(-w / 2, h, -w / 2, h - r);
    s.lineTo(-w / 2, r);
    s.quadraticCurveTo(-w / 2, 0, -w / 2 + r, 0);
    const a = new Path();
    a.absarc(0, DRUM_Y - 0.1, 1.5, 0, Math.PI * 2, true);
    s.holes.push(a);
    return new ExtrudeGeometry(s, { depth: 3.8, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 3, curveSegments: 48 });
  }, []);

export const Tostadora: React.FC = () => {
  const t = useT();
  const cuerpo = useCuerpo();
  const avance = limite((t - PLANTA.tueste[0]) / (PLANTA.tueste[1] - PLANTA.tueste[0]));
  const encendido = tramo(t, [PLANTA.tueste[0] - 0.5, PLANTA.tueste[0]]);
  const giroTambor = -t * 2.3;
  const brasa = new Color(PAL.claro);
  const [x, , z] = ROASTER;
  const zc = z + 0.3;
  return (
    <group>
      <mesh geometry={cuerpo} material={mat(PAL.grafito, 0.5)} position={[x, 0.1, z - 1.9]} castShadow receiveShadow />
      {/* interior */}
      <Cil r={1.5} h={3.5} abierto c={PAL.grafitoSuave} p={[x, DRUM_Y, zc]} rot={[Math.PI / 2, 0, 0]} sombra={false} />
      <Cil r={1.5} h={0.05} c={PAL.grafito} p={[x, DRUM_Y, zc - 1.7]} rot={[Math.PI / 2, 0, 0]} sombra={false} />
      <group position={[x, DRUM_Y, zc]} rotation={[0, 0, giroTambor]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <Caja s={[0.32, 0.06, 3.2]} p={[1.28, 0, 0]} c={PAL.piedra} sombra={false} />
          </group>
        ))}
      </group>
      <pointLight position={[x + 0.3, DRUM_Y + 0.5, FRENTE - 0.4]} intensity={7} distance={6} decay={1.6} color="#ffffff" />
      <Cascada n={300} centro={[x, DRUM_Y, FRENTE - 0.95]} radio={1.3} largo={1.7} llena={PLANTA.llenaTambor} tueste={PLANTA.tueste} />
      {/* marco y cristal */}
      <mesh position={[x, DRUM_Y, FRENTE + 0.14]} material={mat(PAL.acero, 0.3)} castShadow>
        <torusGeometry args={[1.56, 0.13, 20, 64]} />
      </mesh>
      <mesh position={[x, DRUM_Y, FRENTE + 0.13]}>
        <circleGeometry args={[1.5, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.07} roughness={0.08} depthWrite={false} />
      </mesh>
      <Caja s={[0.14, 2.2, 0.01]} p={[x - 0.55, DRUM_Y + 0.15, FRENTE + 0.135]} rot={[0, 0, -0.5]} c={PAL.blanco} sombra={false} r={0.001} />
      <Caja s={[0.5, 0.16, 0.2]} p={[x + 1.25, DRUM_Y + 1.25, FRENTE + 0.2]} c={PAL.acero} />
      {/* quemadores: la llama es del color de marca */}
      {[-1.2, -0.6, 0, 0.6, 1.2].map((dx) => (
        <mesh key={dx} position={[x + dx, 1.06, FRENTE + 0.13]}>
          <capsuleGeometry args={[0.07, 0.16 + encendido * 0.14, 6, 12]} />
          <meshStandardMaterial color={encendido > 0.1 ? PAL.claro : PAL.piedra} emissive={brasa} emissiveIntensity={encendido * 1.1} />
        </mesh>
      ))}
      {/* franja y panel */}
      <Caja s={[4.5, 0.12, 0.05]} p={[x, 0.62, FRENTE + 0.13]} c={PAL.acento} r={0.02} />
      <group position={[x + 2.34, 3.6, z - 0.2]}>
        <Caja s={[0.26, 2.1, 2.2]} c={PAL.blanco} r={0.08} />
        <Caja s={[0.04, 0.7, 1.7]} p={[0.14, 0.52, 0]} c={PAL.grafito} r={0.015} />
        <Caja s={[0.05, 0.42 * (0.08 + avance * 0.92), 1.46 * (0.08 + avance * 0.92)]} p={[0.16, 0.52, 0]} c={PAL.claro} r={0.01} sombra={false} />
        {[-0.5, 0, 0.5].map((dz) => (
          <Cil key={dz} r={0.15} h={0.08} p={[0.16, -0.4, dz]} rot={[0, 0, Math.PI / 2]} c={PAL.acento} />
        ))}
      </group>
      {/* tolva superior y chimenea */}
      <Cil r={1.35} r2={0.5} h={2} abierto p={[x, 6.3, z]} c={PAL.blanco} />
      <Cil r={1.42} h={0.14} p={[x, 7.3, z]} c={PAL.acero} abierto />
      <Monton n={110} centro={[x, 6.95, z]} radio={[1.05, 0.26, 1.05]} nivel={limite((t - PLANTA.banda1 - 3) / 1)} tinte={VERDE} />
      <Caja s={[1.5, 0.3, 1.5]} p={[x, 5.3, z]} c={PAL.piedra} />
      <Cil r={0.42} h={6.4} p={[x + 1.5, 7.9, z - 1.2]} c={PAL.acero} />
      <Cil r={0.56} h={0.4} p={[x + 1.5, 11, z - 1.2]} c={PAL.grafito} />
      {/* rampa de descarga */}
      <group position={[x, 1.86, -7.2]} rotation={[0.2, 0, 0]}>
        <Caja s={[0.95, 0.07, 1.6]} c={PAL.acero} r={0.03} />
        <Caja s={[0.07, 0.3, 1.6]} p={[0.46, 0.13, 0]} c={PAL.acero} r={0.03} />
        <Caja s={[0.07, 0.3, 1.6]} p={[-0.46, 0.13, 0]} c={PAL.acero} r={0.03} />
      </group>
      <Humo origen={[x + 1.5, 11.3, z - 1.2]} desde={PLANTA.tueste[0]} n={18} subida={6} tam={0.8} />
      <Corriente n={120} ruta={RUTA_CAIDA} T={0.8} desde={PLANTA.descargaTambor} tinte={TOSTADO} eje={[1, 0, 0]} ancho={0.7} alto={0.1} />
    </group>
  );
};

/** Bandeja de enfriado: gira con cuatro brazos y saca el calor del café. */
export const Enfriado: React.FC = () => {
  const t = useT();
  const [x, , z] = BANDEJA;
  const giro = -t * 1.25;
  return (
    <group>
      <Cil r={1.1} r2={1.4} h={1.1} p={[x, 0.55, z]} c={PAL.grafitoSuave} />
      <Cil r={2.72} h={0.5} abierto p={[x, 1.55, z]} c={PAL.blanco} />
      <Cil r={2.86} h={0.1} abierto p={[x, 1.82, z]} c={PAL.acento} />
      <Cil r={2.7} h={0.1} p={[x, 1.33, z]} c={PAL.piedra} />
      <group position={[x, 1.68, z]} rotation={[0, giro, 0]}>
        <Cil r={0.3} h={0.5} c={PAL.acero} />
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <Caja s={[2.35, 0.2, 0.1]} p={[1.3, 0, 0]} c={PAL.acero} r={0.03} />
          </group>
        ))}
      </group>
      <Disco n={760} centro={[x, 1.42, z]} radio={2.58} llena={PLANTA.llenaBandeja} vel={-1.1} />
      <Banda a={B2A} b={B2B} desde={PLANTA.banda2} vel={3.2} />
      <Corriente n={340} ruta={RUTA_B2} T={3.4} desde={PLANTA.banda2} tinte={TOSTADO} />
    </group>
  );
};

/** Torre de la empacadora: recibe el café tostado por arriba y llena por la boquilla. */
export const Empacadora: React.FC = () => {
  const t = useT();
  const [x, , z] = EMPACADORA;
  return (
    <group>
      <Caja s={[3.6, 5.9, 3.2]} p={[x, 2.95, z]} c={PAL.blanco} r={0.22} />
      <Caja s={[3.64, 0.34, 3.24]} p={[x, 4.9, z]} c={PAL.acento} r={0.05} />
      <Caja s={[1.8, 2.5, 0.06]} p={[x, 2.4, z + 1.6]} c={PAL.grafito} r={0.03} />
      <Cil r={1.35} r2={0.6} h={2} abierto p={[x, 7, z]} c={PAL.hueso} />
      <Cil r={1.42} h={0.14} abierto p={[x, 8, z]} c={PAL.acero} />
      <Monton n={110} centro={[x, 7.62, z]} radio={[1.05, 0.28, 1.05]} nivel={limite((t - PLANTA.banda2 - 3.4) / 1)} tinte={TOSTADO} />
      <Caja s={[0.9, 0.5, 2.8]} p={[x, 3.9, z + 2.5]} c={PAL.grafitoSuave} r={0.12} />
      <Cil r={0.3} r2={0.17} h={0.9} p={[x, 3.3, -1.4]} c={PAL.acero} />
    </group>
  );
};

export const Maquinas: React.FC = () => (
  <>
    <Entra en={0.25}>
      <Recepcion />
    </Entra>
    <Entra en={0.65}>
      <Tostadora />
    </Entra>
    <Entra en={1.0}>
      <Enfriado />
    </Entra>
    <Entra en={1.35}>
      <Empacadora />
    </Entra>
  </>
);
