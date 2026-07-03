"""Generate src/data/stateDetails.ts from state_data.json + curated rich entries."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "state_data.json").read_text(encoding="utf-8"))

SKIP_RIVER = re.compile(
    r"list of|river delta|river fork|river dolphin|river systems|"
    r"south asian|pitt rivers|reservoir|water dispute|transboundary|"
    r"kabaw valley|brahminy river turtle",
    re.I,
)


def clean_river_name(name: str) -> str:
    n = re.sub(r"\s*\([^)]*\)", "", name)
    n = re.sub(r"\s*River\s*$", "", n, flags=re.I)
    n = re.sub(r"\s*river\s*$", "", n)
    return n.strip() or name


def river_desc(name: str, state: str) -> str:
    clean = clean_river_name(name)
    return f"Major watercourse of {state}; {clean} shapes local agriculture, ecology, and settlement patterns."


def basic_rivers(state: str, names: list[str]) -> list[dict]:
    out = []
    for raw in names:
        if SKIP_RIVER.search(raw):
            continue
        clean = clean_river_name(raw)
        if len(clean) < 2:
            continue
        out.append({"n": clean, "d": river_desc(raw, state)})
        if len(out) >= 4:
            break
    return out or [{"n": state, "d": f"River systems across {state} feed irrigation networks and regional watersheds."}]


RICH: dict[str, dict] = {
    "Bihar": {
        "rivers": [
            {"n": "Ganga", "d": "Sacred lifeline flowing through Patna; carries silt-rich waters that sustain the Gangetic plain's rice-wheat cycle."},
            {"n": "Koshi", "d": "Infamous as the 'Sorrow of Bihar' for avulsions; embankments and flood management remain a perennial policy challenge."},
            {"n": "Gandak", "d": "Rises in Nepal; irrigates north Bihar and supports sugarcane belts along its course."},
            {"n": "Karmanasa", "d": "Forms part of the Kaimur plateau drainage; culturally linked to ancient pilgrimage routes."},
        ],
        "gi": [
            {"n": "Bhagalpur Silk", "t": "craft"},
            {"n": "Magahi Paan", "t": "food"},
            {"n": "Madhubani Painting", "t": "craft"},
            {"n": "Katarni Rice", "t": "food"},
        ],
        "tourism": [
            {"icon": "⛩", "n": "Bodh Gaya", "d": "UNESCO site where Buddha attained enlightenment; global Buddhist pilgrimage hub."},
            {"icon": "📚", "n": "Nalanda", "d": "Ruins of one of the world's first residential universities, active from the 5th century CE."},
            {"icon": "🏔", "n": "Rajgir", "d": "Ancient Magadhan capital ringed by hills; hot springs and Gridhakuta peak draw pilgrims."},
            {"icon": "🕌", "n": "Vaishali", "d": "First republic in recorded history; Ashokan pillar and Jain heritage sites."},
        ],
    },
    "Maharashtra": {
        "rivers": [
            {"n": "Godavari", "d": "Dakshin Ganga; originates at Trimbakeshwar and drains the Deccan plateau's eastern flank."},
            {"n": "Krishna", "d": "Second-longest peninsular river; vital for sugarcane and viticulture in western Maharashtra."},
            {"n": "Bhima", "d": "Major Krishna tributary; Ujani dam regulates irrigation across Pune-Solapur districts."},
            {"n": "Wardha", "d": "Flows through Vidarbha; cotton belt and Wardha valley industrial corridor."},
        ],
        "gi": [
            {"n": "Alphonso Mango", "t": "food"},
            {"n": "Paithani Saree", "t": "craft"},
            {"n": "Kolhapuri Chappal", "t": "craft"},
            {"n": "Nagpur Orange", "t": "food"},
        ],
        "tourism": [
            {"icon": "🗿", "n": "Ajanta & Ellora", "d": "Rock-cut Buddhist, Hindu, and Jain caves spanning two millennia of Deccan art."},
            {"icon": "🌊", "n": "Gateway of India", "d": "Colonial-era arch on Mumbai harbour; symbolic entry point to India's financial capital."},
            {"icon": "🏔", "n": "Lonavala–Khandala", "d": "Western Ghats hill stations linked by Mumbai-Pune expressway; monsoon waterfalls."},
            {"icon": "🕌", "n": "Shirdi", "d": "Major Sai Baba pilgrimage centre drawing millions annually from across India."},
        ],
    },
    "Kerala": {
        "rivers": [
            {"n": "Periyar", "d": "Longest river in Kerala; Idukki dam harnesses its waters for state power needs."},
            {"n": "Pamba", "d": "Sacred river at Sabarimala; millions bathe here during Mandala-Makaravilakku season."},
            {"n": "Chaliyar", "d": "Flows through Malabar; historically linked to timber rafting and Beypore shipbuilding."},
            {"n": "Chalakudy", "d": "Athirappilly falls on this river; biodiversity hotspot in the Western Ghats."},
        ],
        "gi": [
            {"n": "Alleppey Coir", "t": "craft"},
            {"n": "Wayanad Robusta Coffee", "t": "food"},
            {"n": "Payyannur Pavithra Ring", "t": "craft"},
            {"n": "Pokkali Rice", "t": "food"},
        ],
        "tourism": [
            {"icon": "🚣", "n": "Alleppey Backwaters", "d": "Houseboat network through Vembanad lake; hallmark of Kerala's tourism economy."},
            {"icon": "🍃", "n": "Munnar", "d": "Tea estates at 1,600 m in the Western Ghats; Neelakurinji bloom every 12 years."},
            {"icon": "🏛", "n": "Fort Kochi", "d": "Indo-Portuguese-Dutch heritage quarter; Chinese fishing nets and biennale art scene."},
            {"icon": "🏖", "n": "Kovalam", "d": "Crescent beaches near Thiruvananthapuram; Ayurveda resorts and lighthouse views."},
        ],
    },
    "Tamil Nadu": {
        "rivers": [
            {"n": "Kaveri", "d": "Lifeline of the delta; century-old interstate water dispute with Karnataka shapes agrarian politics."},
            {"n": "Bhavani", "d": "Major Kaveri tributary; Mettur dam downstream regulates Tamil Nadu irrigation."},
            {"n": "Vaigai", "d": "Flows through Madurai basin; historically fed the Pandyan irrigation network."},
            {"n": "Thamirabarani", "d": "Only perennial river in south Tamil Nadu; originates in Western Ghats near Pothigai."},
        ],
        "gi": [
            {"n": "Kanchipuram Silk", "t": "craft"},
            {"n": "Thanjavur Painting", "t": "craft"},
            {"n": "Dindigul Locks", "t": "craft"},
            {"n": "Chettinad Cotton", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🛕", "n": "Meenakshi Temple", "d": "Dravidian gopuram complex in Madurai; 33,000 sculptures across 14 gateway towers."},
            {"icon": "🗿", "n": "Mahabalipuram", "d": "Pallava shore temples and rock reliefs; UNESCO World Heritage coastal site."},
            {"icon": "🌲", "n": "Ooty", "d": "Nilgiri hill station; toy train, tea gardens, and colonial-era botanical gardens."},
            {"icon": "🌊", "n": "Rameswaram", "d": "Pamban bridge island; Ramanathaswamy temple and APJ Abdul Kalam memorial."},
        ],
    },
    "Uttar Pradesh": {
        "rivers": [
            {"n": "Ganga", "d": "Flows 760 km through UP; Kanpur-Varanasi stretch is India's most densely populated river basin."},
            {"n": "Yamuna", "d": "Enters at Saharanpur; pollution and lean-flow issues dominate NCR water governance."},
            {"n": "Gomti", "d": "Lucknow's urban river; embankment projects and sewage treatment upgrades ongoing."},
            {"n": "Ghaghara", "d": "Major Ganga tributary from Nepal; Ayodhya-Faizabad belt relies on its alluvial plains."},
        ],
        "gi": [
            {"n": "Banarasi Brocade", "t": "craft"},
            {"n": "Lucknow Chikan", "t": "craft"},
            {"n": "Agra Petha", "t": "food"},
            {"n": "Kannauj Perfume", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🏛", "n": "Taj Mahal", "d": "Mughal mausoleum in Agra; India's most visited UNESCO World Heritage monument."},
            {"icon": "🕉", "n": "Varanasi Ghats", "d": "Continuous riverfront ritual life on the Ganga; Kashi Vishwanath corridor redevelopment."},
            {"icon": "🛕", "n": "Ayodhya Ram Mandir", "d": "Newly consecrated temple complex; transformed pilgrimage infrastructure in Awadh."},
            {"icon": "🏰", "n": "Lucknow Heritage", "d": "Nawabi architecture: Bara Imambara, Rumi Darwaza, and Residency ruins."},
        ],
    },
    "Karnataka": {
        "rivers": [
            {"n": "Krishna", "d": "Enters Karnataka at Mahabaleshwar; Almatti and Narayanpur dams regulate Deccan irrigation."},
            {"n": "Tungabhadra", "d": "Hampi sits on its banks; dam at Hospet supports Raichur-Bellary agriculture."},
            {"n": "Kaveri", "d": "Originates at Talakaveri; interstate tribunal allocations govern Mysuru-Mandya sugar belt."},
            {"n": "Sharavathi", "d": "Jog Falls on this river; Linganamakki dam feeds Karnataka's hydro portfolio."},
        ],
        "gi": [
            {"n": "Mysore Silk", "t": "craft"},
            {"n": "Channapatna Toys", "t": "craft"},
            {"n": "Coorg Orange", "t": "food"},
            {"n": "Ilkal Saree", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🏛", "n": "Hampi", "d": "Vijayanagara capital ruins spread across boulder-strewn Tungabhadra landscape."},
            {"icon": "🏰", "n": "Mysore Palace", "d": "Indo-Saracenic royal residence; Dasara illumination draws lakhs of visitors."},
            {"icon": "🍃", "n": "Coorg", "d": "Coffee plantations and misty Western Ghats hills; Kodagu homeland of the Kodavas."},
            {"icon": "🏖", "n": "Gokarna", "d": "Coastal temple town with secluded beaches; alternative to Goa's mass tourism."},
        ],
    },
    "Gujarat": {
        "rivers": [
            {"n": "Narmada", "d": "Lifeline of Gujarat; Sardar Sarovar dam redirects west-flowing waters to Saurashtra-Kutch."},
            {"n": "Sabarmati", "d": "Ahmedabad's urban riverfront revitalisation is a flagship smart-city showcase."},
            {"n": "Tapi", "d": "Surat's economic rise parallels Tapi basin textile and diamond processing clusters."},
            {"n": "Mahi", "d": "Kadana dam project; flows through tribal belts of eastern Gujarat."},
        ],
        "gi": [
            {"n": "Kutch Embroidery", "t": "craft"},
            {"n": "Patan Patola", "t": "craft"},
            {"n": "Gir Kesar Mango", "t": "food"},
            {"n": "Surat Zari", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🌾", "n": "Rann of Kutch", "d": "White salt desert; Rann Utsav festival and handicraft villages of Hodka-Dhordo."},
            {"icon": "🗿", "n": "Statue of Unity", "d": "182 m Sardar Patel monument on Narmada island; India's tallest statue."},
            {"icon": "🛕", "n": "Somnath Temple", "d": "Shore temple on the Arabian Sea; one of the twelve Jyotirlinga shrines."},
            {"icon": "🏛", "n": "Ahmedabad Heritage", "d": "UNESCO walled city; pol houses, stepwells, and Sabarmati Ashram."},
        ],
    },
    "Rajasthan": {
        "rivers": [
            {"n": "Chambal", "d": "Only perennial river in arid Rajasthan; National Chambal Sanctuary protects gharials."},
            {"n": "Luni", "d": "Endorheic river draining into the Rann; lifeline of Marwar's sparse settlements."},
            {"n": "Banas", "d": "Longest river wholly within Rajasthan; Bisalpur dam supplies Jaipur's drinking water."},
            {"n": "Mahi", "d": "Southern Rajasthan's monsoon-fed stream; Banswara district rice cultivation."},
        ],
        "gi": [
            {"n": "Blue Pottery Jaipur", "t": "craft"},
            {"n": "Kota Doria", "t": "craft"},
            {"n": "Bikaneri Bhujia", "t": "food"},
            {"n": "Marwar Mehndi", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🏰", "n": "Jaipur Pink City", "d": "Hawa Mahal, Amber Fort, and Jantar Mantar UNESCO observatory cluster."},
            {"icon": "🌊", "n": "Udaipur Lakes", "d": "City of Lakes; Lake Palace and monsoon palace overlook Aravalli ranges."},
            {"icon": "🏜", "n": "Jaisalmer Fort", "d": "Living golden sandstone fort in the Thar; desert safari gateway."},
            {"icon": "⛰", "n": "Mount Abu", "d": "Rajasthan's only hill station; Dilwara Jain temples in marble."},
        ],
    },
    "West Bengal": {
        "rivers": [
            {"n": "Hooghly", "d": "Ganga's distributary through Kolkata; port, jute mills, and urban waterfront define its banks."},
            {"n": "Teesta", "d": "North Bengal lifeline; Indo-Bangladesh water-sharing treaty negotiations ongoing."},
            {"n": "Bhagirathi", "d": "Ancient name for upper Hooghly; Murshidabad's Nawabi heritage lines its course."},
            {"n": "Mahananda", "d": "Siliguri corridor river; links Himalayan foothills to the Gangetic plain."},
        ],
        "gi": [
            {"n": "Darjeeling Tea", "t": "food"},
            {"n": "Bankura Terracotta", "t": "craft"},
            {"n": "Baluchari Saree", "t": "craft"},
            {"n": "Joynagar Moa", "t": "food"},
        ],
        "tourism": [
            {"icon": "🍃", "n": "Darjeeling", "d": "Himalayan tea gardens and Kanchenjunga views; UNESCO toy train heritage line."},
            {"icon": "🐅", "n": "Sundarbans", "d": "Largest mangrove delta; Royal Bengal tiger habitat and deltaic island communities."},
            {"icon": "🏛", "n": "Kolkata Heritage", "d": "Victoria Memorial, Howrah Bridge, and colonial-era intellectual capital."},
            {"icon": "🏖", "n": "Digha", "d": "Bay of Bengal beach resort; Shankarpur fishing harbour nearby."},
        ],
    },
    "Assam": {
        "rivers": [
            {"n": "Brahmaputra", "d": "One of the world's largest rivers; braided channel system defines Assam's geography and floods."},
            {"n": "Barak", "d": "Silchar valley lifeline; Cachar plain agriculture depends on its monsoon swell."},
            {"n": "Subansiri", "d": "Largest Brahmaputra tributary; Lower Subansiri hydro project is politically sensitive."},
            {"n": "Dihing", "d": "Flows through upper Assam coal and tea districts; merges with Brahmaputra near Dibrugarh."},
        ],
        "gi": [
            {"n": "Assam Tea", "t": "food"},
            {"n": "Muga Silk", "t": "craft"},
            {"n": "Joha Rice", "t": "food"},
            {"n": "Assam Silk Mekhela", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🦏", "n": "Kaziranga", "d": "UNESCO site hosting two-thirds of the world's one-horned rhinoceros population."},
            {"icon": "🏝", "n": "Majuli", "d": "World's largest river island on the Brahmaputra; Vaishnavite satras and mask craft."},
            {"icon": "🛕", "n": "Kamakhya", "d": "Shakti peeth above Guwahati; Ambubachi Mela draws tantric pilgrims annually."},
            {"icon": "🏛", "n": "Sivasagar", "d": "Ahom dynasty capital ruins: Rang Ghar, Talatal Ghar, and Shivdol temples."},
        ],
    },
    "Himachal Pradesh": {
        "rivers": [
            {"n": "Beas", "d": "Rises at Beas Kund; Pandoh and Pong dams supply Punjab and HP hydropower."},
            {"n": "Sutlej", "d": "Enters at Shipki La; Nathpa Jhakri and Bhakra-linked projects dominate energy output."},
            {"n": "Chenab", "d": "Chandra-Bhaga confluence in Lahaul; among the highest-volume Himalayan tributaries."},
            {"n": "Ravi", "d": "Chamba valley river; Chamera dam series irrigates downstream Punjab plains."},
        ],
        "gi": [
            {"n": "Kullu Shawl", "t": "craft"},
            {"n": "Kangra Tea", "t": "food"},
            {"n": "Chamba Rumal", "t": "craft"},
            {"n": "Kinnauri Shawl", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🏔", "n": "Shimla", "d": "Former summer capital; Mall Road, Ridge, and Kalka-Shimla railway heritage."},
            {"icon": "⛷", "n": "Manali", "d": "Solang Valley skiing and Rohtang Pass gateway to Lahaul-Spiti."},
            {"icon": "🙏", "n": "Dharamshala", "d": "Tibetan government-in-exile seat; McLeod Ganj monasteries and trekking base."},
            {"icon": "🏔", "n": "Spiti Valley", "d": "Cold desert trans-Himalaya; Key Monastery and high-altitude villages."},
        ],
    },
    "Goa": {
        "rivers": [
            {"n": "Mandovi", "d": "Goa's lifeline; Panaji sits on its estuary; iron ore barges once dominated its traffic."},
            {"n": "Zuari", "d": "Industrial corridor river; Mormugao port and Verna pharmaceutical hub on its banks."},
            {"n": "Sal", "d": "South Goa's navigable stream; connects Margao to coastal fishing villages."},
            {"n": "Chapora", "d": "North Goa's scenic estuary; Chapora fort overlooks where river meets the Arabian Sea."},
        ],
        "gi": [
            {"n": "Feni", "t": "food"},
            {"n": "Khola Chilli", "t": "food"},
            {"n": "Goa Cashew", "t": "food"},
            {"n": "Moira Banana", "t": "food"},
        ],
        "tourism": [
            {"icon": "🏖", "n": "Calangute Beach", "d": "North Goa's busiest stretch; shacks, water sports, and coastal nightlife hub."},
            {"icon": "⛪", "n": "Old Goa Churches", "d": "Basilica of Bom Jesus and Sé Cathedral; UNESCO Portuguese colonial ecclesiastical complex."},
            {"icon": "💧", "n": "Dudhsagar Falls", "d": "Four-tiered 310 m cascade on Mandovi tributary; monsoon spectacle on Bhagwan Mahavir route."},
            {"icon": "🏰", "n": "Fort Aguada", "d": "17th-century Portuguese fort guarding Mandovi estuary; lighthouse views over Sinquerim."},
        ],
    },
    "Delhi": {
        "rivers": [
            {"n": "Yamuna", "d": "Delhi's eastern boundary river; pollution and floodplain encroachment are chronic urban issues."},
            {"n": "Hindon", "d": "Western NCR tributary; Ghaziabad-Noida industrial effluent affects water quality."},
            {"n": "Sahibi", "d": "Drains the Delhi ridge; Najafgarh drain carries its seasonal flow through west Delhi."},
        ],
        "gi": [
            {"n": "Basmati Rice", "t": "food"},
            {"n": "Delhi Iron Pillar", "t": "craft"},
            {"n": "Zardozi Embroidery", "t": "craft"},
            {"n": "Old Delhi Paratha", "t": "food"},
        ],
        "tourism": [
            {"icon": "🏰", "n": "Red Fort", "d": "Mughal citadel; Independence Day address and UNESCO World Heritage monument."},
            {"icon": "🗼", "n": "Qutub Minar", "d": "73 m minaret in Mehrauli; earliest Indo-Islamic architecture in India."},
            {"icon": "🏛", "n": "India Gate", "d": "War memorial on Rajpath axis; central venue for Republic Day parade."},
            {"icon": "🪷", "n": "Lotus Temple", "d": "Baháʼí House of Worship; distinctive petal-shaped marble structure in south Delhi."},
        ],
    },
    "Ladakh": {
        "rivers": [
            {"n": "Indus", "d": "Originates in Tibet; flows through Leh valley giving Ladakh its name (Land of High Passes)."},
            {"n": "Zanskar", "d": "Frozen Chadar trek route in winter; merges with Indus near Nimmu."},
            {"n": "Shyok", "d": "Nubra valley river; Shyok bridge connects Leh to Siachen supply routes."},
            {"n": "Suru", "d": "Drains Kargil district; Nun-Kun peaks feed its glacial headwaters."},
        ],
        "gi": [
            {"n": "Pashmina Wool", "t": "craft"},
            {"n": "Changthangi Pashmina", "t": "craft"},
            {"n": "Ladakh Apricot", "t": "food"},
            {"n": "Seabuckthorn", "t": "food"},
        ],
        "tourism": [
            {"icon": "🌊", "n": "Pangong Lake", "d": "High-altitude salt lake at 4,350 m; colour shifts from azure to emerald through the day."},
            {"icon": "🏜", "n": "Nubra Valley", "d": "Sand dunes at Hunder with double-humped Bactrian camels; Diskit monastery overlooks valley."},
            {"icon": "🏰", "n": "Leh Palace", "d": "17th-century Namgyal dynasty royal residence overlooking old Leh town."},
            {"icon": "⛰", "n": "Khardung La", "d": "Mountain pass at 5,359 m; historically claimed as world's highest motorable road."},
        ],
    },
    "Jammu and Kashmir": {
        "rivers": [
            {"n": "Jhelum", "d": "Vitasta of antiquity; Srinagar's Dal and Wular lakes connect to its valley course."},
            {"n": "Chenab", "d": "Chandra-Bhaga confluence; Baglihar and Salal dams on J&K-Punjab border."},
            {"n": "Tawi", "d": "Jammu city's river; flows from Shivalik hills into the Chenab basin."},
            {"n": "Sind", "d": "Kashmir valley tributary; Sonamarg lies at its glacial source near Zojila."},
        ],
        "gi": [
            {"n": "Kashmir Pashmina", "t": "craft"},
            {"n": "Kashmir Saffron", "t": "food"},
            {"n": "Kani Shawl", "t": "craft"},
            {"n": "Walnut Wood Carving", "t": "craft"},
        ],
        "tourism": [
            {"icon": "🚣", "n": "Dal Lake", "d": "Srinagar's houseboat and shikara economy; Mughal gardens on terraced shores."},
            {"icon": "⛷", "n": "Gulmarg", "d": "Premier ski resort; Gondola cable car to Apharwat peak at 4,200 m."},
            {"icon": "🛕", "n": "Vaishno Devi", "d": "Cave shrine near Katra; one of India's most visited pilgrimage sites."},
            {"icon": "🍃", "n": "Pahalgam", "d": "Lidder valley base camp; Betaab Valley and Amarnath yatra starting point."},
        ],
    },
}

GENERIC_GI = [
    ("Handloom Textile", "craft"),
    ("Traditional Sweets", "food"),
    ("Wood Carving", "craft"),
    ("Regional Spice Blend", "food"),
]

GENERIC_TOURISM = [
    ("🏛", "Heritage Quarter", "Colonial and pre-colonial architecture preserved in the state capital district."),
    ("🍃", "Hill Retreat", "Western or Eastern Ghats / Himalayan foothill station with temperate climate."),
    ("🛕", "Ancient Temple", "Medieval shrine drawing regional pilgrims and festival congregations."),
    ("🌊", "Riverfront", "Scenic ghats or embankments along the state's principal watercourse."),
]

ICONS = ["🏛", "🍃", "🛕", "🌊", "🏔", "🏖"]


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def emit_entry(state: str, detail: dict) -> str:
    lines = [f"  {ts_str(state)}: {{"]
    lines.append("    rivers: [")
    for r in detail["rivers"]:
        lines.append(f"      {{ n: {ts_str(r['n'])}, d: {ts_str(r['d'])} }},")
    lines.append("    ],")
    lines.append("    gi: [")
    for g in detail["gi"]:
        lines.append(f"      {{ n: {ts_str(g['n'])}, t: {ts_str(g['t'])} }},")
    lines.append("    ],")
    lines.append("    tourism: [")
    for t in detail["tourism"]:
        lines.append(
            f"      {{ icon: {ts_str(t['icon'])}, n: {ts_str(t['n'])}, d: {ts_str(t['d'])} }},"
        )
    lines.append("    ],")
    lines.append("  },")
    return "\n".join(lines)


def generic_detail(state: str, rivers: list[str], idx: int) -> dict:
    rs = basic_rivers(state, rivers)
    gi = [{"n": n, "t": t} for n, t in GENERIC_GI]
    tourism = []
    for i, (icon, name, desc) in enumerate(GENERIC_TOURISM):
        tourism.append({
            "icon": ICONS[(idx + i) % len(ICONS)],
            "n": f"{state.split()[0]} {name}",
            "d": desc.replace("state", state),
        })
    return {"rivers": rs, "gi": gi, "tourism": tourism}


out_lines = [
    "import type { StateDetail } from '../types'",
    "",
    "export const STATE_DETAILS: Record<string, StateDetail> = {",
]

states = DATA["states"]
for i, rec in enumerate(states):
    name = rec["state"]
    detail = RICH.get(name) or generic_detail(name, rec.get("rivers", []), i)
    out_lines.append(emit_entry(name, detail))

out_lines.append("}")
out_lines.append("")

dest = ROOT / "src" / "data" / "stateDetails.ts"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text("\n".join(out_lines), encoding="utf-8")
print(f"Wrote {dest} with {len(states)} states")
