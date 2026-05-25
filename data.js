const WORLD_CUP_DATA = {
  teams: {
    // Grupo A
    "MEX": { id: "MEX", name: "México", flag: "mx", group: "A", rating: 80 },
    "RSA": { id: "RSA", name: "Sudáfrica", flag: "za", group: "A", rating: 65 },
    "KOR": { id: "KOR", name: "Corea del Sur", flag: "kr", group: "A", rating: 75 },
    "CZE": { id: "CZE", name: "República Checa", flag: "cz", group: "A", rating: 74 },
    
    // Grupo B
    "CAN": { id: "CAN", name: "Canadá", flag: "ca", group: "B", rating: 73 },
    "BIH": { id: "BIH", name: "Bosnia", flag: "ba", group: "B", rating: 70 },
    "QAT": { id: "QAT", name: "Qatar", flag: "qa", group: "B", rating: 62 },
    "SUI": { id: "SUI", name: "Suiza", flag: "ch", group: "B", rating: 78 },
    
    // Grupo C
    "BRA": { id: "BRA", name: "Brasil", flag: "br", group: "C", rating: 92 },
    "MAR": { id: "MAR", name: "Marruecos", flag: "ma", group: "C", rating: 83 },
    "HAI": { id: "HAI", name: "Haití", flag: "ht", group: "C", rating: 55 },
    "SCO": { id: "SCO", name: "Escocia", flag: "gb-sct", group: "C", rating: 71 },
    
    // Grupo D
    "USA": { id: "USA", name: "Estados Unidos", flag: "us", group: "D", rating: 81 },
    "PAR": { id: "PAR", name: "Paraguay", flag: "py", group: "D", rating: 74 },
    "AUS": { id: "AUS", name: "Australia", flag: "au", group: "D", rating: 73 },
    "TUR": { id: "TUR", name: "Turquía", flag: "tr", group: "D", rating: 77 },
    
    // Grupo E
    "GER": { id: "GER", name: "Alemania", flag: "de", group: "E", rating: 88 },
    "CUW": { id: "CUW", name: "Curazao", flag: "cw", group: "E", rating: 58 },
    "CIV": { id: "CIV", name: "Costa de Marfil", flag: "ci", group: "E", rating: 76 },
    "ECU": { id: "ECU", name: "Ecuador", flag: "ec", group: "E", rating: 78 },
    
    // Grupo F
    "NED": { id: "NED", name: "Países Bajos", flag: "nl", group: "F", rating: 87 },
    "JPN": { id: "JPN", name: "Japón", flag: "jp", group: "F", rating: 81 },
    "SWE": { id: "SWE", name: "Suecia", flag: "se", group: "F", rating: 79 },
    "TUN": { id: "TUN", name: "Túnez", flag: "tn", group: "F", rating: 71 },
    
    // Grupo G
    "BEL": { id: "BEL", name: "Bélgica", flag: "be", group: "G", rating: 85 },
    "EGY": { id: "EGY", name: "Egipto", flag: "eg", group: "G", rating: 76 },
    "IRN": { id: "IRN", name: "Irán", flag: "ir", group: "G", rating: 73 },
    "NZL": { id: "NZL", name: "Nueva Zelanda", flag: "nz", group: "G", rating: 60 },
    
    // Grupo H
    "ESP": { id: "ESP", name: "España", flag: "es", group: "H", rating: 90 },
    "CPV": { id: "CPV", name: "Cabo Verde", flag: "cv", group: "H", rating: 68 },
    "KSA": { id: "KSA", name: "Arabia Saudita", flag: "sa", group: "H", rating: 69 },
    "URU": { id: "URU", name: "Uruguay", flag: "uy", group: "H", rating: 84 },
    
    // Grupo I
    "FRA": { id: "FRA", name: "Francia", flag: "fr", group: "I", rating: 93 },
    "SEN": { id: "SEN", name: "Senegal", flag: "sn", group: "I", rating: 79 },
    "IRQ": { id: "IRQ", name: "Irak", flag: "iq", group: "I", rating: 67 },
    "NOR": { id: "NOR", name: "Noruega", flag: "no", group: "I", rating: 76 },
    
    // Grupo J
    "ARG": { id: "ARG", name: "Argentina", flag: "ar", group: "J", rating: 94 },
    "ALG": { id: "ALG", name: "Argelia", flag: "dz", group: "J", rating: 74 },
    "AUT": { id: "AUT", name: "Austria", flag: "at", group: "J", rating: 77 },
    "JOR": { id: "JOR", name: "Jordania", flag: "jo", group: "J", rating: 63 },
    
    // Grupo K
    "POR": { id: "POR", name: "Portugal", flag: "pt", group: "K", rating: 89 },
    "COD": { id: "COD", name: "RD Congo", flag: "cd", group: "K", rating: 70 },
    "UZB": { id: "UZB", name: "Uzbekistán", flag: "uz", group: "K", rating: 68 },
    "COL": { id: "COL", name: "Colombia", flag: "co", group: "K", rating: 82 },
    
    // Grupo L
    "ENG": { id: "ENG", name: "Inglaterra", flag: "gb-eng", group: "L", rating: 91 },
    "CRO": { id: "CRO", name: "Croacia", flag: "hr", group: "L", rating: 84 },
    "GHA": { id: "GHA", name: "Ghana", flag: "gh", group: "L", rating: 72 },
    "PAN": { id: "PAN", name: "Panamá", flag: "pa", group: "L", rating: 68 }
  },

  groups: {
    "A": ["MEX", "RSA", "KOR", "CZE"],
    "B": ["CAN", "BIH", "QAT", "SUI"],
    "C": ["BRA", "MAR", "HAI", "SCO"],
    "D": ["USA", "PAR", "AUS", "TUR"],
    "E": ["GER", "CUW", "CIV", "ECU"],
    "F": ["NED", "JPN", "SWE", "TUN"],
    "G": ["BEL", "EGY", "IRN", "NZL"],
    "H": ["ESP", "CPV", "KSA", "URU"],
    "I": ["FRA", "SEN", "IRQ", "NOR"],
    "J": ["ARG", "ALG", "AUT", "JOR"],
    "K": ["POR", "COD", "UZB", "COL"],
    "L": ["ENG", "CRO", "GHA", "PAN"]
  },

  groupMatches: [
    { id: 1, group: "A", jornada: 1, date: "Jueves 11 de junio", time: "15:00", team1: "MEX", team2: "RSA", stadium: "Estadio Ciudad de México", city: "CDMX" },
    { id: 2, group: "A", jornada: 1, date: "Jueves 11 de junio", time: "22:00", team1: "KOR", team2: "CZE", stadium: "Estadio Guadalajara", city: "Guadalajara" },
    { id: 3, group: "A", jornada: 2, date: "Jueves 18 de junio", time: "12:00", team1: "CZE", team2: "RSA", stadium: "Estadio Atlanta", city: "Atlanta" },
    { id: 4, group: "A", jornada: 2, date: "Jueves 18 de junio", time: "21:00", team1: "MEX", team2: "KOR", stadium: "Estadio Guadalajara", city: "Guadalajara" },
    { id: 5, group: "A", jornada: 3, date: "Miércoles 24 de junio", time: "21:00", team1: "MEX", team2: "CZE", stadium: "Estadio Ciudad de México", city: "CDMX" },
    { id: 6, group: "A", jornada: 3, date: "Miércoles 24 de junio", time: "21:00", team1: "RSA", team2: "KOR", stadium: "Estadio Monterrey", city: "Monterrey" },
    { id: 7, group: "B", jornada: 1, date: "Viernes 12 de junio", time: "15:00", team1: "CAN", team2: "BIH", stadium: "Estadio Toronto", city: "Toronto" },
    { id: 8, group: "B", jornada: 1, date: "Sábado 13 de junio", time: "15:00", team1: "QAT", team2: "SUI", stadium: "Estadio Bahía de San Francisco", city: "Santa Clara" },
    { id: 9, group: "B", jornada: 2, date: "Jueves 18 de junio", time: "15:00", team1: "SUI", team2: "BIH", stadium: "Estadio Los Ángeles", city: "Los Angeles" },
    { id: 10, group: "B", jornada: 2, date: "Jueves 18 de junio", time: "18:00", team1: "CAN", team2: "QAT", stadium: "Estadio BC Place Vancouver", city: "Vancouver" },
    { id: 11, group: "B", jornada: 3, date: "Miércoles 24 de junio", time: "15:00", team1: "CAN", team2: "SUI", stadium: "Estadio BC Place Vancouver", city: "Vancouver" },
    { id: 12, group: "B", jornada: 3, date: "Miércoles 24 de junio", time: "15:00", team1: "BIH", team2: "QAT", stadium: "Estadio Seattle", city: "Seattle" },
    { id: 13, group: "C", jornada: 1, date: "Sábado 13 de junio", time: "18:00", team1: "BRA", team2: "MAR", stadium: "Estadio Nueva York Nueva Jersey", city: "New Jersey" },
    { id: 14, group: "C", jornada: 1, date: "Sábado 13 de junio", time: "21:00", team1: "HAI", team2: "SCO", stadium: "Estadio Boston", city: "Boston" },
    { id: 15, group: "C", jornada: 2, date: "Viernes 19 de junio", time: "21:00", team1: "BRA", team2: "HAI", stadium: "Estadio Filadelfia", city: "Philadelphia" },
    { id: 16, group: "C", jornada: 2, date: "Viernes 19 de junio", time: "18:00", team1: "SCO", team2: "MAR", stadium: "Estadio Boston", city: "Boston" },
    { id: 17, group: "C", jornada: 3, date: "Miércoles 24 de junio", time: "18:00", team1: "SCO", team2: "BRA", stadium: "Estadio Miami", city: "Miami" },
    { id: 18, group: "C", jornada: 3, date: "Miércoles 24 de junio", time: "18:00", team1: "MAR", team2: "HAI", stadium: "Estadio Atlanta", city: "Atlanta" },
    { id: 19, group: "D", jornada: 1, date: "Viernes 12 de junio", time: "21:00", team1: "USA", team2: "PAR", stadium: "Estadio Los Ángeles", city: "Los Angeles" },
    { id: 20, group: "D", jornada: 1, date: "Domingo 14 de junio", time: "00:00", team1: "AUS", team2: "TUR", stadium: "Estadio BC Place Vancouver", city: "Vancouver" },
    { id: 21, group: "D", jornada: 2, date: "Sábado 20 de junio", time: "00:00", team1: "TUR", team2: "PAR", stadium: "Estadio Bahía de San Francisco", city: "Santa Clara" },
    { id: 22, group: "D", jornada: 2, date: "Viernes 19 de junio", time: "15:00", team1: "USA", team2: "AUS", stadium: "Estadio Seattle", city: "Seattle" },
    { id: 23, group: "D", jornada: 3, date: "Jueves 25 de junio", time: "22:00", team1: "USA", team2: "TUR", stadium: "Estadio Los Ángeles", city: "Los Angeles" },
    { id: 24, group: "D", jornada: 3, date: "Jueves 25 de junio", time: "22:00", team1: "PAR", team2: "AUS", stadium: "Estadio Bahía de San Francisco", city: "Santa Clara" },
    { id: 25, group: "E", jornada: 1, date: "Domingo 14 de junio", time: "13:00", team1: "GER", team2: "CUW", stadium: "Estadio Houston", city: "Houston" },
    { id: 26, group: "E", jornada: 1, date: "Domingo 14 de junio", time: "19:00", team1: "CIV", team2: "ECU", stadium: "Estadio Filadelfia", city: "Philadelphia" },
    { id: 27, group: "E", jornada: 2, date: "Sábado 20 de junio", time: "16:00", team1: "GER", team2: "CIV", stadium: "Estadio Toronto", city: "Toronto" },
    { id: 28, group: "E", jornada: 2, date: "Sábado 20 de junio", time: "22:00", team1: "ECU", team2: "CUW", stadium: "Estadio Kansas City", city: "Kansas City" },
    { id: 29, group: "E", jornada: 3, date: "Jueves 25 de junio", time: "16:00", team1: "ECU", team2: "GER", stadium: "Estadio Nueva York Nueva Jersey", city: "New Jersey" },
    { id: 30, group: "E", jornada: 3, date: "Jueves 25 de junio", time: "16:00", team1: "CUW", team2: "CIV", stadium: "Estadio Filadelfia", city: "Philadelphia" },
    { id: 31, group: "F", jornada: 1, date: "Domingo 14 de junio", time: "16:00", team1: "NED", team2: "JPN", stadium: "Estadio Dallas", city: "Arlington" },
    { id: 32, group: "F", jornada: 1, date: "Domingo 14 de junio", time: "22:00", team1: "SWE", team2: "TUN", stadium: "Estadio Monterrey", city: "Monterrey" },
    { id: 33, group: "F", jornada: 2, date: "Sábado 20 de junio", time: "13:00", team1: "NED", team2: "SWE", stadium: "Estadio Houston", city: "Houston" },
    { id: 34, group: "F", jornada: 2, date: "Domingo 21 de junio", time: "00:00", team1: "TUN", team2: "JPN", stadium: "Estadio Monterrey", city: "Monterrey" },
    { id: 35, group: "F", jornada: 3, date: "Jueves 25 de junio", time: "19:00", team1: "TUN", team2: "NED", stadium: "Estadio Kansas City", city: "Kansas City" },
    { id: 36, group: "F", jornada: 3, date: "Jueves 25 de junio", time: "19:00", team1: "JPN", team2: "SWE", stadium: "Estadio Dallas", city: "Arlington" },
    { id: 37, group: "G", jornada: 1, date: "Lunes 15 de junio", time: "15:00", team1: "BEL", team2: "EGY", stadium: "Estadio Seattle", city: "Seattle" },
    { id: 38, group: "G", jornada: 1, date: "Lunes 15 de junio", time: "21:00", team1: "IRN", team2: "NZL", stadium: "Estadio Los Ángeles", city: "Los Angeles" },
    { id: 39, group: "G", jornada: 2, date: "Domingo 21 de junio", time: "15:00", team1: "BEL", team2: "IRN", stadium: "Estadio Los Ángeles", city: "Los Angeles" },
    { id: 40, group: "G", jornada: 2, date: "Domingo 21 de junio", time: "21:00", team1: "NZL", team2: "EGY", stadium: "Estadio BC Place Vancouver", city: "Vancouver" },
    { id: 41, group: "G", jornada: 3, date: "Viernes 26 de junio", time: "23:00", team1: "NZL", team2: "BEL", stadium: "Estadio BC Place Vancouver", city: "Vancouver" },
    { id: 42, group: "G", jornada: 3, date: "Viernes 26 de junio", time: "23:00", team1: "EGY", team2: "IRN", stadium: "Estadio Seattle", city: "Seattle" },
    { id: 43, group: "H", jornada: 1, date: "Lunes 15 de junio", time: "12:00", team1: "ESP", team2: "CPV", stadium: "Estadio Atlanta", city: "Atlanta" },
    { id: 44, group: "H", jornada: 1, date: "Lunes 15 de junio", time: "18:00", team1: "KSA", team2: "URU", stadium: "Estadio Miami", city: "Miami" },
    { id: 45, group: "H", jornada: 2, date: "Domingo 21 de junio", time: "12:00", team1: "ESP", team2: "KSA", stadium: "Estadio Atlanta", city: "Atlanta" },
    { id: 46, group: "H", jornada: 2, date: "Domingo 21 de junio", time: "18:00", team1: "URU", team2: "CPV", stadium: "Estadio Miami", city: "Miami" },
    { id: 47, group: "H", jornada: 3, date: "Viernes 26 de junio", time: "20:00", team1: "URU", team2: "ESP", stadium: "Estadio Guadalajara", city: "Guadalajara" },
    { id: 48, group: "H", jornada: 3, date: "Viernes 26 de junio", time: "20:00", team1: "CPV", team2: "KSA", stadium: "Estadio Houston", city: "Houston" },
    { id: 49, group: "I", jornada: 1, date: "Martes 16 de junio", time: "15:00", team1: "FRA", team2: "SEN", stadium: "Estadio Nueva York Nueva Jersey", city: "New Jersey" },
    { id: 50, group: "I", jornada: 1, date: "Martes 16 de junio", time: "18:00", team1: "IRQ", team2: "NOR", stadium: "Estadio Boston", city: "Boston" },
    { id: 51, group: "I", jornada: 2, date: "Lunes 22 de junio", time: "17:00", team1: "FRA", team2: "IRQ", stadium: "Estadio Filadelfia", city: "Philadelphia" },
    { id: 52, group: "I", jornada: 2, date: "Lunes 22 de junio", time: "20:00", team1: "NOR", team2: "SEN", stadium: "Estadio Nueva York Nueva Jersey", city: "New Jersey" },
    { id: 53, group: "I", jornada: 3, date: "Viernes 26 de junio", time: "15:00", team1: "NOR", team2: "FRA", stadium: "Estadio Boston", city: "Boston" },
    { id: 54, group: "I", jornada: 3, date: "Viernes 26 de junio", time: "15:00", team1: "SEN", team2: "IRQ", stadium: "Estadio Toronto", city: "Toronto" },
    { id: 55, group: "J", jornada: 1, date: "Martes 16 de junio", time: "21:00", team1: "ARG", team2: "ALG", stadium: "Estadio Kansas City", city: "Kansas City" },
    { id: 56, group: "J", jornada: 1, date: "Miércoles 17 de junio", time: "00:00", team1: "AUT", team2: "JOR", stadium: "Estadio Bahía de San Francisco", city: "Santa Clara" },
    { id: 57, group: "J", jornada: 2, date: "Lunes 22 de junio", time: "13:00", team1: "ARG", team2: "AUT", stadium: "Estadio Dallas", city: "Arlington" },
    { id: 58, group: "J", jornada: 2, date: "Lunes 22 de junio", time: "23:00", team1: "JOR", team2: "ALG", stadium: "Estadio Bahía de San Francisco Bay", city: "Santa Clara" },
    { id: 59, group: "J", jornada: 3, date: "Sábado 27 de junio", time: "22:00", team1: "JOR", team2: "ARG", stadium: "Estadio Dallas", city: "Arlington" },
    { id: 60, group: "J", jornada: 3, date: "Sábado 27 de junio", time: "22:00", team1: "ALG", team2: "AUT", stadium: "Estadio Kansas City", city: "Kansas City" },
    { id: 61, group: "K", jornada: 1, date: "Miércoles 17 de junio", time: "13:00", team1: "POR", team2: "COD", stadium: "Estadio Houston", city: "Houston" },
    { id: 62, group: "K", jornada: 1, date: "Miércoles 17 de junio", time: "22:00", team1: "UZB", team2: "COL", stadium: "Estadio Ciudad de México", city: "CDMX" },
    { id: 63, group: "K", jornada: 2, date: "Martes 23 de junio", time: "13:00", team1: "POR", team2: "UZB", stadium: "Estadio Houston", city: "Houston" },
    { id: 64, group: "K", jornada: 2, date: "Martes 23 de junio", time: "22:00", team1: "COL", team2: "COD", stadium: "Estadio Guadalajara", city: "Guadalajara" },
    { id: 65, group: "K", jornada: 3, date: "Sábado 27 de junio", time: "19:30", team1: "COL", team2: "POR", stadium: "Estadio Miami", city: "Miami" },
    { id: 66, group: "K", jornada: 3, date: "Sábado 27 de junio", time: "19:30", team1: "COD", team2: "UZB", stadium: "Estadio Atlanta", city: "Atlanta" },
    { id: 67, group: "L", jornada: 1, date: "Miércoles 17 de junio", time: "16:00", team1: "ENG", team2: "CRO", stadium: "Estadio Dallas", city: "Arlington" },
    { id: 68, group: "L", jornada: 1, date: "Miércoles 17 de junio", time: "19:00", team1: "GHA", team2: "PAN", stadium: "Estadio Toronto", city: "Toronto" },
    { id: 69, group: "L", jornada: 2, date: "Martes 23 de junio", time: "16:00", team1: "ENG", team2: "GHA", stadium: "Estadio Boston", city: "Boston" },
    { id: 70, group: "L", jornada: 2, date: "Martes 23 de junio", time: "19:00", team1: "PAN", team2: "CRO", stadium: "Estadio Toronto", city: "Toronto" },
    { id: 71, group: "L", jornada: 3, date: "Sábado 27 de junio", time: "17:00", team1: "PAN", team2: "ENG", stadium: "Estadio Nueva York Nueva Jersey", city: "New Jersey" },
    { id: 72, group: "L", jornada: 3, date: "Sábado 27 de junio", time: "17:00", team1: "CRO", team2: "GHA", stadium: "Estadio Filadelfia", city: "Philadelphia" }
  ],

  knockoutMatches: {
    "R32": [
        {
            "id": 73,
            "label": "Cruce 73",
            "date": "Domingo 28 de junio",
            "time": "15:00",
            "stadium": "SoFi Stadium",
            "city": "Los Angeles",
            "team1Placeholder": "2º Grupo A",
            "team2Placeholder": "2º Grupo B"
        },
        {
            "id": 76,
            "label": "Cruce 76",
            "date": "Lunes 29 de junio",
            "time": "13:00",
            "stadium": "NRG Stadium",
            "city": "Houston",
            "team1Placeholder": "1º Grupo C",
            "team2Placeholder": "2º Grupo F"
        },
        {
            "id": 74,
            "label": "Cruce 74",
            "date": "Lunes 29 de junio",
            "time": "16:30",
            "stadium": "Gillette Stadium",
            "city": "Boston",
            "team1Placeholder": "1º Grupo E",
            "team2Placeholder": "3º Grupo A/B/C/D/F"
        },
        {
            "id": 75,
            "label": "Cruce 75",
            "date": "Martes 30 de junio",
            "time": "21:00",
            "stadium": "Estadio BBVA",
            "city": "Monterrey",
            "team1Placeholder": "1º Grupo F",
            "team2Placeholder": "2º Grupo C"
        },
        {
            "id": 78,
            "label": "Cruce 78",
            "date": "Martes 30 de junio",
            "time": "13:00",
            "stadium": "AT&T Stadium",
            "city": "Arlington",
            "team1Placeholder": "2º Grupo E",
            "team2Placeholder": "2º Grupo I"
        },
        {
            "id": 77,
            "label": "Cruce 77",
            "date": "Martes 30 de junio",
            "time": "17:00",
            "stadium": "MetLife Stadium",
            "city": "New Jersey",
            "team1Placeholder": "1º Grupo I",
            "team2Placeholder": "3º Grupo C/D/F/G/H"
        },
        {
            "id": 79,
            "label": "Cruce 79",
            "date": "Miércoles 1 de julio",
            "time": "21:00",
            "stadium": "Estadio Azteca",
            "city": "CDMX",
            "team1Placeholder": "1º Grupo A",
            "team2Placeholder": "3º Grupo C/E/F/H/I"
        },
        {
            "id": 80,
            "label": "Cruce 80",
            "date": "Miércoles 1 de julio",
            "time": "12:00",
            "stadium": "Mercedes-Benz Stadium",
            "city": "Atlanta",
            "team1Placeholder": "1º Grupo L",
            "team2Placeholder": "3º Grupo E/H/I/J/K"
        },
        {
            "id": 82,
            "label": "Cruce 82",
            "date": "Miércoles 1 de julio",
            "time": "16:00",
            "stadium": "Lumen Field",
            "city": "Seattle",
            "team1Placeholder": "1º Grupo G",
            "team2Placeholder": "3º Grupo A/E/H/I/J"
        },
        {
            "id": 83,
            "label": "Cruce 83",
            "date": "Jueves 2 de julio",
            "time": "19:00",
            "stadium": "BMO Field",
            "city": "Toronto",
            "team1Placeholder": "2º Grupo K",
            "team2Placeholder": "2º Grupo L"
        },
        {
            "id": 81,
            "label": "Cruce 81",
            "date": "Jueves 2 de julio",
            "time": "20:00",
            "stadium": "Levi's Stadium",
            "city": "Santa Clara",
            "team1Placeholder": "1º Grupo D",
            "team2Placeholder": "3º Grupo B/E/F/I/J"
        },
        {
            "id": 85,
            "label": "Cruce 85",
            "date": "Jueves 2 de julio",
            "time": "23:00",
            "stadium": "BC Place",
            "city": "Vancouver",
            "team1Placeholder": "1º Grupo B",
            "team2Placeholder": "3º Grupo E/F/G/I/J"
        },
        {
            "id": 84,
            "label": "Cruce 84",
            "date": "Jueves 2 de julio",
            "time": "15:00",
            "stadium": "SoFi Stadium",
            "city": "Los Angeles",
            "team1Placeholder": "1º Grupo H",
            "team2Placeholder": "2º Grupo J"
        },
        {
            "id": 86,
            "label": "Cruce 86",
            "date": "Viernes 3 de julio",
            "time": "18:00",
            "stadium": "Hard Rock Stadium",
            "city": "Miami",
            "team1Placeholder": "1º Grupo J",
            "team2Placeholder": "2º Grupo H"
        },
        {
            "id": 87,
            "label": "Cruce 87",
            "date": "Viernes 3 de julio",
            "time": "21:30",
            "stadium": "Arrowhead Stadium",
            "city": "Kansas City",
            "team1Placeholder": "1º Grupo K",
            "team2Placeholder": "3º Grupo D/E/I/J/L"
        },
        {
            "id": 88,
            "label": "Cruce 88",
            "date": "Viernes 3 de julio",
            "time": "14:00",
            "stadium": "AT&T Stadium",
            "city": "Arlington",
            "team1Placeholder": "2º Grupo D",
            "team2Placeholder": "2º Grupo G"
        }
    ],
    "R16": [
        {
            "id": 90,
            "label": "Cruce 90",
            "date": "Sábado 4 de julio",
            "time": "13:00",
            "stadium": "NRG Stadium",
            "city": "Houston",
            "team1Source": {
                "matchId": 73
            },
            "team2Source": {
                "matchId": 75
            }
        },
        {
            "id": 89,
            "label": "Cruce 89",
            "date": "Sábado 4 de julio",
            "time": "17:00",
            "stadium": "Lincoln Financial Field",
            "city": "Philadelphia",
            "team1Source": {
                "matchId": 74
            },
            "team2Source": {
                "matchId": 77
            }
        },
        {
            "id": 92,
            "label": "Cruce 92",
            "date": "Lunes 6 de julio",
            "time": "20:00",
            "stadium": "Estadio Azteca",
            "city": "CDMX",
            "team1Source": {
                "matchId": 79
            },
            "team2Source": {
                "matchId": 80
            }
        },
        {
            "id": 91,
            "label": "Cruce 91",
            "date": "Domingo 5 de julio",
            "time": "16:00",
            "stadium": "MetLife Stadium",
            "city": "New Jersey",
            "team1Source": {
                "matchId": 76
            },
            "team2Source": {
                "matchId": 78
            }
        },
        {
            "id": 93,
            "label": "Cruce 93",
            "date": "Lunes 6 de julio",
            "time": "15:00",
            "stadium": "AT&T Stadium",
            "city": "Arlington",
            "team1Source": {
                "matchId": 83
            },
            "team2Source": {
                "matchId": 84
            }
        },
        {
            "id": 94,
            "label": "Cruce 94",
            "date": "Martes 7 de julio",
            "time": "20:00",
            "stadium": "Lumen Field",
            "city": "Seattle",
            "team1Source": {
                "matchId": 81
            },
            "team2Source": {
                "matchId": 82
            }
        },
        {
            "id": 95,
            "label": "Cruce 95",
            "date": "Martes 7 de julio",
            "time": "12:00",
            "stadium": "Mercedes-Benz Stadium",
            "city": "Atlanta",
            "team1Source": {
                "matchId": 86
            },
            "team2Source": {
                "matchId": 88
            }
        },
        {
            "id": 96,
            "label": "Cruce 96",
            "date": "Martes 7 de julio",
            "time": "16:00",
            "stadium": "BC Place",
            "city": "Vancouver",
            "team1Source": {
                "matchId": 85
            },
            "team2Source": {
                "matchId": 87
            }
        }
    ],
    "QF": [
        {
            "id": 97,
            "label": "Cruce 97",
            "date": "Jueves 9 de julio",
            "time": "16:00",
            "stadium": "Gillette Stadium",
            "city": "Boston",
            "team1Source": {
                "matchId": 89
            },
            "team2Source": {
                "matchId": 90
            }
        },
        {
            "id": 98,
            "label": "Cruce 98",
            "date": "Viernes 10 de julio",
            "time": "15:00",
            "stadium": "SoFi Stadium",
            "city": "Los Angeles",
            "team1Source": {
                "matchId": 93
            },
            "team2Source": {
                "matchId": 94
            }
        },
        {
            "id": 99,
            "label": "Cruce 99",
            "date": "Sábado 11 de julio",
            "time": "17:00",
            "stadium": "Hard Rock Stadium",
            "city": "Miami",
            "team1Source": {
                "matchId": 91
            },
            "team2Source": {
                "matchId": 92
            }
        },
        {
            "id": 100,
            "label": "Cruce 100",
            "date": "Sábado 11 de julio",
            "time": "21:00",
            "stadium": "Arrowhead Stadium",
            "city": "Kansas City",
            "team1Source": {
                "matchId": 95
            },
            "team2Source": {
                "matchId": 96
            }
        }
    ],
    "SF": [
        {
            "id": 101,
            "label": "Semifinal 1",
            "date": "Martes 14 de julio",
            "time": "15:00",
            "stadium": "AT&T Stadium",
            "city": "Arlington",
            "team1Source": {
                "matchId": 97
            },
            "team2Source": {
                "matchId": 98
            }
        },
        {
            "id": 102,
            "label": "Semifinal 2",
            "date": "Miércoles 15 de julio",
            "time": "15:00",
            "stadium": "Mercedes-Benz Stadium",
            "city": "Atlanta",
            "team1Source": {
                "matchId": 99
            },
            "team2Source": {
                "matchId": 100
            }
        }
    ],
    "3RD": [
        {
            "id": 103,
            "label": "Tercer Puesto",
            "date": "Sábado 18 de julio",
            "time": "17:00",
            "stadium": "Hard Rock Stadium",
            "city": "Miami",
            "team1Source": {
                "matchId": 101,
                "loser": true
            },
            "team2Source": {
                "matchId": 102,
                "loser": true
            }
        }
    ],
    "F": [
        {
            "id": 104,
            "label": "Gran Final",
            "date": "Domingo 19 de julio",
            "time": "15:00",
            "stadium": "MetLife Stadium",
            "city": "New Jersey",
            "team1Source": {
                "matchId": 101
            },
            "team2Source": {
                "matchId": 102
            }
        }
    ]
}
};

// Deterministic generator for official results (simulating a tournament in progress)
function generateOfficialScores() {
  // Fully completed group stage
  WORLD_CUP_DATA.groupMatches.forEach(m => {
    const t1 = WORLD_CUP_DATA.teams[m.team1];
    const t2 = WORLD_CUP_DATA.teams[m.team2];
    
    // Deterministic pseudo-random number based on match ID
    const seed = Math.sin(m.id) * 10000;
    const rand = seed - Math.floor(seed);
    
    // expected goals based on ratings
    let lambda1 = 1.35 + (t1.rating - t2.rating) / 35;
    let lambda2 = 1.35 + (t2.rating - t1.rating) / 35;
    lambda1 = Math.max(0.2, Math.min(3.5, lambda1));
    lambda2 = Math.max(0.2, Math.min(3.5, lambda2));
    
    m.g1 = Math.floor(lambda1 + rand * 1.3);
    m.g2 = Math.floor(lambda2 + (1 - rand) * 1.3);
  });
  
  // Round of 32: matches 73, 74, 75, 76 are played
  const playedR32Ids = [73, 74, 75, 76];
  WORLD_CUP_DATA.knockoutMatches.R32.forEach(m => {
    if (playedR32Ids.includes(m.id)) {
      const seed = Math.sin(m.id) * 10000;
      const rand = seed - Math.floor(seed);
      m.g1 = rand > 0.5 ? 2 : 1;
      m.g2 = rand > 0.5 ? 1 : 2;
    } else {
      m.g1 = null;
      m.g2 = null;
    }
  });
  
  // The rest of the knockout matches are not played yet
  const otherStages = ['R16', 'QF', 'SF', 'F', '3RD'];
  otherStages.forEach(stage => {
    WORLD_CUP_DATA.knockoutMatches[stage].forEach(m => {
      m.g1 = null;
      m.g2 = null;
    });
  });
}
generateOfficialScores();

// Adjust match schedules to the user's local timezone/calendar days using device localization.
function adjustMatchesToLocalTime() {
  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  function adjustMatch(m) {
    if (!m || !m.date || !m.time) return;
    
    // Extract hours and minutes
    const timeMatch = m.time.match(/(\d+):(\d+)/);
    if (!timeMatch) return;
    const hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    
    // Extract day and month from current date string
    const dateStr = m.date.toLowerCase();
    let monthIdx = 5; // June (0-indexed = 5)
    if (dateStr.includes('julio')) {
      monthIdx = 6; // July (0-indexed = 6)
    }
    const dayMatch = dateStr.match(/\d+/);
    if (!dayMatch) return;
    const day = parseInt(dayMatch[0], 10);
    
    // Create UTC date representation of Eastern Time (EDT, which is UTC-4 in June/July 2026)
    // To represent EDT correctly in UTC, we add 4 hours to the hour.
    const matchDate = new Date(Date.UTC(2026, monthIdx, day, hour + 4, minute));
    
    // Format local date and time using browser's local timezone (local getters)
    const newDayOfWeek = daysOfWeek[matchDate.getDay()];
    const newDayNum = matchDate.getDate();
    const newMonth = months[matchDate.getMonth()];
    
    m.date = `${newDayOfWeek} ${newDayNum} de ${newMonth}`;
    
    const newHourStr = String(matchDate.getHours()).padStart(2, '0');
    const newMinStr = String(matchDate.getMinutes()).padStart(2, '0');
    m.time = `${newHourStr}:${newMinStr} h`;
  }

  // Process all matches
  WORLD_CUP_DATA.groupMatches.forEach(adjustMatch);
  Object.values(WORLD_CUP_DATA.knockoutMatches).forEach(stageMatches => {
    stageMatches.forEach(adjustMatch);
  });
}
adjustMatchesToLocalTime();

// Dynamic date and time clock updater in header
function startHeaderClock() {
  const element = document.getElementById('current-datetime');
  if (!element) return;
  
  function update() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    element.textContent = `${capitalizedDate} • ${timeStr}`;
  }
  
  update();
  setInterval(update, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHeaderClock);
} else {
  startHeaderClock();
}
