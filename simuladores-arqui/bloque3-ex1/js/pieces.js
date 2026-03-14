/* ==========================================
   PIECES.JS — Piece Library Data
   ========================================== */
const ERAS = {
  clasica: {
    id: 'clasica',
    name: 'Era Clásica',
    period: 'Siglos V a.C. – II d.C.',
    description: 'La arquitectura clásica se caracteriza por los órdenes arquitectónicos (dórico, jónico, corintio), la simetría geométrica y la proporción matemática. Grecia y Roma establecieron los cánones que perduran hasta hoy.',
    characteristics: ['Órdenes clásicos', 'Simetría', 'Proporción áurea', 'Frontones', 'Columnatas'],
    color: '#d4a574',
    materialColor: 0xd4a574,
    secondaryColor: 0xc49464
  },
  gotica: {
    id: 'gotica',
    name: 'Medieval / Gótica',
    period: 'Siglos XII – XVI',
    description: 'La arquitectura gótica busca la verticalidad y la luz. Se caracteriza por arcos apuntados, bóvedas de crucería y arbotantes que permiten elevar muros y abrir grandes vitrales.',
    characteristics: ['Arcos apuntados', 'Bóvedas de crucería', 'Arbotantes', 'Vitrales', 'Verticalidad'],
    color: '#6b8cc7',
    materialColor: 0x6b8cc7,
    secondaryColor: 0x5b7cb7
  },
  renacentista: {
    id: 'renacentista',
    name: 'Renacentista',
    period: 'Siglos XV – XVII',
    description: 'El Renacimiento recupera los ideales clásicos con un enfoque en la proporción matemática, la cúpula como elemento central y la reinterpretación de los órdenes griegos y romanos.',
    characteristics: ['Cúpulas', 'Proporción matemática', 'Simetría central', 'Órdenes reinterpretados', 'Arcos de medio punto'],
    color: '#b06478',
    materialColor: 0xb06478,
    secondaryColor: 0xa05468
  }
};

const PIECES = {
  clasica: {
    structural: [
      { id: 'cl_col_doric', name: 'Columna Dórica', icon: '🏛️', type: 'structural', era: 'clasica', desc: 'Columna robusta sin basa, con capitel simple y fuste estriado.', geomType: 'column', height: 4, radius: 0.25, segments: 8, snapType: 'floor' },
      { id: 'cl_col_ionic', name: 'Columna Jónica', icon: '🏛️', type: 'structural', era: 'clasica', desc: 'Columna esbelta con volutas en el capitel.', geomType: 'column', height: 4.5, radius: 0.22, segments: 12, snapType: 'floor' },
      { id: 'cl_col_corinthian', name: 'Columna Corintia', icon: '🏛️', type: 'structural', era: 'clasica', desc: 'La más ornamentada del orden clásico, con hojas de acanto.', geomType: 'column', height: 5, radius: 0.22, segments: 16, snapType: 'floor' },
      { id: 'cl_entablature', name: 'Entablamento', icon: '🔲', type: 'structural', era: 'clasica', desc: 'Viga horizontal sobre las columnas: arquitrabe, friso y cornisa.', geomType: 'beam', width: 2, height: 0.6, depth: 0.8, snapType: 'top' },
      { id: 'cl_pediment', name: 'Frontón', icon: '🔺', type: 'structural', era: 'clasica', desc: 'Elemento triangular que corona la fachada del templo.', geomType: 'pediment', width: 4, height: 1.5, depth: 0.5, snapType: 'top' },
      { id: 'cl_barrel_vault', name: 'Bóveda de Cañón', icon: '🌉', type: 'structural', era: 'clasica', desc: 'Cubierta semicircular continua, típica de la arquitectura romana.', geomType: 'barrel_vault', width: 2, height: 1.5, depth: 3, snapType: 'top' },
      { id: 'cl_wall', name: 'Muro Clásico', icon: '🧱', type: 'structural', era: 'clasica', desc: 'Muro de sillería con aparejo regular.', geomType: 'wall', width: 2, height: 3, depth: 0.4, snapType: 'floor' },
      { id: 'cl_base', name: 'Plataforma/Estilobato', icon: '⬜', type: 'structural', era: 'clasica', desc: 'Base escalonada que eleva el templo.', geomType: 'platform', width: 2, height: 0.4, depth: 2, snapType: 'floor' }
    ],
    ornamental: [
      { id: 'cl_capital_doric', name: 'Capitel Dórico', icon: '🔘', type: 'ornamental', era: 'clasica', desc: 'Capitel simple con equino y ábaco.', geomType: 'capital', width: 0.6, height: 0.3, snapType: 'top' },
      { id: 'cl_capital_ionic', name: 'Capitel Jónico', icon: '🌀', type: 'ornamental', era: 'clasica', desc: 'Capitel con volutas laterales características.', geomType: 'capital_ionic', width: 0.7, height: 0.35, snapType: 'top' },
      { id: 'cl_triglyph', name: 'Triglifo', icon: '📊', type: 'ornamental', era: 'clasica', desc: 'Elemento decorativo del friso dórico con tres bandas verticales.', geomType: 'ornament_block', width: 0.5, height: 0.5, depth: 0.3, snapType: 'wall' },
      { id: 'cl_metope', name: 'Metopa', icon: '🖼️', type: 'ornamental', era: 'clasica', desc: 'Panel decorativo entre triglifos, con relieves escultóricos.', geomType: 'ornament_block', width: 0.5, height: 0.5, depth: 0.2, snapType: 'wall' },
      { id: 'cl_molding', name: 'Moldura Clásica', icon: '〰️', type: 'ornamental', era: 'clasica', desc: 'Perfil decorativo horizontal.', geomType: 'molding', width: 2, height: 0.15, depth: 0.2, snapType: 'wall' },
      { id: 'cl_acroterion', name: 'Acrotera', icon: '🌿', type: 'ornamental', era: 'clasica', desc: 'Ornamento en los vértices del frontón.', geomType: 'ornament_small', width: 0.4, height: 0.6, snapType: 'top' }
    ]
  },
  gotica: {
    structural: [
      { id: 'go_pointed_arch', name: 'Arco Apuntado', icon: '⛪', type: 'structural', era: 'gotica', desc: 'Arco ojival: la pieza clave de la arquitectura gótica.', geomType: 'pointed_arch', width: 2, height: 3, depth: 0.5, snapType: 'top' },
      { id: 'go_ribbed_vault', name: 'Bóveda de Crucería', icon: '✝️', type: 'structural', era: 'gotica', desc: 'Bóveda con nervios diagonales que distribuyen los empujes.', geomType: 'ribbed_vault', width: 2, height: 2, depth: 2, snapType: 'top' },
      { id: 'go_buttress', name: 'Arbotante', icon: '🏗️', type: 'structural', era: 'gotica', desc: 'Arco exterior que transmite empujes laterales al contrafuerte.', geomType: 'flying_buttress', width: 2.5, height: 3, depth: 0.4, snapType: 'wall_side' },
      { id: 'go_pier', name: 'Pilar Compuesto', icon: '🗼', type: 'structural', era: 'gotica', desc: 'Pilar con columnillas adosadas.', geomType: 'clustered_pier', height: 5, radius: 0.3, snapType: 'floor' },
      { id: 'go_wall', name: 'Muro Gótico', icon: '🧱', type: 'structural', era: 'gotica', desc: 'Muro con contrafuertes integrados y ventanales.', geomType: 'wall', width: 2, height: 4, depth: 0.5, snapType: 'floor' },
      { id: 'go_counter', name: 'Contrafuerte', icon: '🧱', type: 'structural', era: 'gotica', desc: 'Pilar grueso adosado al muro para recibir empujes.', geomType: 'counterfuerte', width: 0.6, height: 4, depth: 0.8, snapType: 'floor' },
      { id: 'go_base', name: 'Basamento Gótico', icon: '⬜', type: 'structural', era: 'gotica', desc: 'Base de piedra para la catedral.', geomType: 'platform', width: 2, height: 0.3, depth: 2, snapType: 'floor' }
    ],
    ornamental: [
      { id: 'go_rose_window', name: 'Rosetón', icon: '🌹', type: 'ornamental', era: 'gotica', desc: 'Gran ventanal circular con tracería radial y vidrieras.', geomType: 'rose_window', radius: 1, snapType: 'wall' },
      { id: 'go_tracery', name: 'Tracería', icon: '🕸️', type: 'ornamental', era: 'gotica', desc: 'Decoración calada en piedra para ventanales.', geomType: 'tracery_panel', width: 1, height: 2, snapType: 'wall' },
      { id: 'go_gargoyle', name: 'Gárgola', icon: '🐉', type: 'ornamental', era: 'gotica', desc: 'Figurilla de desagüe con forma zoomorfa.', geomType: 'gargoyle', width: 0.5, height: 0.4, depth: 0.8, snapType: 'wall' },
      { id: 'go_pinnacle', name: 'Pináculo', icon: '📍', type: 'ornamental', era: 'gotica', desc: 'Remate piramidal sobre contrafuertes.', geomType: 'pinnacle', height: 1.2, radius: 0.2, snapType: 'top' },
      { id: 'go_crocket', name: 'Cardina/Crocket', icon: '🌿', type: 'ornamental', era: 'gotica', desc: 'Follaje decorativo que trepa por aristas y pináculos.', geomType: 'ornament_small', width: 0.3, height: 0.3, snapType: 'wall' },
      { id: 'go_finial', name: 'Florón', icon: '⚜️', type: 'ornamental', era: 'gotica', desc: 'Remate floral en la cúspide de pináculos.', geomType: 'ornament_small', width: 0.3, height: 0.4, snapType: 'top' }
    ]
  },
  renacentista: {
    structural: [
      { id: 're_dome', name: 'Cúpula', icon: '🕌', type: 'structural', era: 'renacentista', desc: 'Cúpula hemisférica sobre tambor, elemento central renacentista.', geomType: 'dome', radius: 1.5, height: 1.5, snapType: 'top' },
      { id: 're_round_arch', name: 'Arco de Medio Punto', icon: '🌈', type: 'structural', era: 'renacentista', desc: 'Arco semicircular heredado de Roma.', geomType: 'round_arch', width: 2, height: 2.5, depth: 0.5, snapType: 'top' },
      { id: 're_pilaster', name: 'Pilastra', icon: '🏛️', type: 'structural', era: 'renacentista', desc: 'Columna plana adosada al muro como elemento ordenador.', geomType: 'pilaster', width: 0.4, height: 4, depth: 0.15, snapType: 'floor' },
      { id: 're_cornice', name: 'Cornisa', icon: '➖', type: 'structural', era: 'renacentista', desc: 'Moldura saliente que separa pisos y corona muros.', geomType: 'cornice', width: 2, height: 0.3, depth: 0.4, snapType: 'wall' },
      { id: 're_wall', name: 'Muro Renacentista', icon: '🧱', type: 'structural', era: 'renacentista', desc: 'Muro con almohadillado o revoco liso.', geomType: 'wall', width: 2, height: 3.5, depth: 0.4, snapType: 'floor' },
      { id: 're_drum', name: 'Tambor', icon: '🥁', type: 'structural', era: 'renacentista', desc: 'Cuerpo cilíndrico que eleva la cúpula.', geomType: 'drum', radius: 1.5, height: 1.5, snapType: 'top' },
      { id: 're_base', name: 'Basamento', icon: '⬜', type: 'structural', era: 'renacentista', desc: 'Base de piedra con molduras.', geomType: 'platform', width: 2, height: 0.35, depth: 2, snapType: 'floor' }
    ],
    ornamental: [
      { id: 're_rustication', name: 'Almohadillado', icon: '🪨', type: 'ornamental', era: 'renacentista', desc: 'Sillares con juntas rehundidas para textura en fachadas.', geomType: 'rustication', width: 1, height: 0.5, depth: 0.3, snapType: 'wall' },
      { id: 're_balustrade', name: 'Balaustrada', icon: '🏛️', type: 'ornamental', era: 'renacentista', desc: 'Barandilla con balaustres torneados.', geomType: 'balustrade', width: 2, height: 0.8, depth: 0.2, snapType: 'top' },
      { id: 're_medallion', name: 'Medallón', icon: '🎖️', type: 'ornamental', era: 'renacentista', desc: 'Relieve circular decorativo en fachada.', geomType: 'medallion', radius: 0.4, snapType: 'wall' },
      { id: 're_lantern', name: 'Linterna', icon: '🔦', type: 'ornamental', era: 'renacentista', desc: 'Torrecilla que corona la cúpula para iluminar.', geomType: 'lantern', radius: 0.5, height: 1.2, snapType: 'top' },
      { id: 're_scroll', name: 'Voluta/Cartela', icon: '📜', type: 'ornamental', era: 'renacentista', desc: 'Ornamento en espiral o cartucho decorativo.', geomType: 'ornament_small', width: 0.4, height: 0.5, snapType: 'wall' },
      { id: 're_pediment_orn', name: 'Frontón Curvo', icon: '🔼', type: 'ornamental', era: 'renacentista', desc: 'Frontón con perfil curvo sobre puertas y ventanas.', geomType: 'curved_pediment', width: 1.2, height: 0.5, depth: 0.2, snapType: 'top' }
    ]
  }
};
