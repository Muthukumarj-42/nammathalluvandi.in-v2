/**
 * Tamil Nadu RTO District Vehicle Registration Mappings (145 zones/locations)
 * Used to assign RTO code prefix for unique cart codes (e.g., ntv-tn38001).
 */

export interface RtoEntry {
  locationKeywords: string[];
  rtoCode: string; // e.g. "TN38"
}

export const TN_RTO_MAP: RtoEntry[] = [
  // CHENNAI NORTH ZONE
  { locationKeywords: ["ayanavaram", "chennai c", "chennai central"], rtoCode: "TN01" },
  { locationKeywords: ["tondiarpet", "chennai ne"], rtoCode: "TN03" },
  { locationKeywords: ["anna nagar", "chennai nw"], rtoCode: "TN02" },
  { locationKeywords: ["basin bridge", "chennai e"], rtoCode: "TN04" },
  { locationKeywords: ["vyasarpadi", "chennai n"], rtoCode: "TN05" },
  { locationKeywords: ["redhills", "red hills"], rtoCode: "TN18" },
  { locationKeywords: ["gummidipoondi"], rtoCode: "TN18Y" },
  { locationKeywords: ["ambattur"], rtoCode: "TN13" },
  { locationKeywords: ["tiruvallur", "thiruvallur"], rtoCode: "TN20" },
  { locationKeywords: ["thiruthani", "tiruttani"], rtoCode: "TN20X" },
  { locationKeywords: ["poonamallee", "poonamalle"], rtoCode: "TN12" },

  // CHENNAI SOUTH ZONE
  { locationKeywords: ["tiruvanmiyur", "thiruvanmiyur", "chennai s"], rtoCode: "TN07" },
  { locationKeywords: ["mandaveli", "chennai se"], rtoCode: "TN06" },
  { locationKeywords: ["k.k.nagar", "kk nagar", "chennai w"], rtoCode: "TN09" },
  { locationKeywords: ["valasarawakkam", "chennai sw"], rtoCode: "TN10" },
  { locationKeywords: ["meenambakkam", "alandur"], rtoCode: "TN22" },
  { locationKeywords: ["kundrathur"], rtoCode: "TN85" },
  { locationKeywords: ["tambaram"], rtoCode: "TN11" },
  { locationKeywords: ["sholinganallur"], rtoCode: "TN14" },
  { locationKeywords: ["kancheepuram", "kanchipuram"], rtoCode: "TN21" },
  { locationKeywords: ["sriperumbudur"], rtoCode: "TN87" },
  { locationKeywords: ["chengalpattu", "chengalpet"], rtoCode: "TN19" },
  { locationKeywords: ["thirukazhugundram"], rtoCode: "TN19Y" },
  { locationKeywords: ["madurantagam", "maduranthakam"], rtoCode: "TN19Z" },

  // VILLUPURAM ZONE
  { locationKeywords: ["villupuram", "viluppuram"], rtoCode: "TN32" },
  { locationKeywords: ["ulundurpet"], rtoCode: "TN15" },
  { locationKeywords: ["kallakurichi"], rtoCode: "TN15MA" },
  { locationKeywords: ["tindivanam"], rtoCode: "TN16" },
  { locationKeywords: ["gingee"], rtoCode: "TN16Z" },
  { locationKeywords: ["cuddalore"], rtoCode: "TN31" },
  { locationKeywords: ["panruti"], rtoCode: "TN31Z" },
  { locationKeywords: ["neyveli"], rtoCode: "TN31Y" },
  { locationKeywords: ["chidambaram"], rtoCode: "TN91" },
  { locationKeywords: ["virudhachalam", "vriddhachalam"], rtoCode: "TN91Z" },
  { locationKeywords: ["tiruvannamalai", "thiruvannamalai"], rtoCode: "TN25" },
  { locationKeywords: ["arani", "arni"], rtoCode: "TN97" },
  { locationKeywords: ["cheyyar"], rtoCode: "TN97Z" },

  // VELLORE ZONE
  { locationKeywords: ["vellore"], rtoCode: "TN23" },
  { locationKeywords: ["gudiyatham", "gudiyattam"], rtoCode: "TN23T" },
  { locationKeywords: ["vaniyambadi"], rtoCode: "TN83" },
  { locationKeywords: ["ambur"], rtoCode: "TN83Y" },
  { locationKeywords: ["tirupattur", "tirupathur"], rtoCode: "TN83MA" },
  { locationKeywords: ["ranipet"], rtoCode: "TN73" },
  { locationKeywords: ["arakkonam"], rtoCode: "TN73Z" },
  { locationKeywords: ["krishnagiri"], rtoCode: "TN24" },
  { locationKeywords: ["hosur", "hozur"], rtoCode: "TN70" },

  // SALEM ZONE
  { locationKeywords: ["salem west", "salem w"], rtoCode: "TN30" },
  { locationKeywords: ["omalur"], rtoCode: "TN30W" },
  { locationKeywords: ["salem east", "salem e"], rtoCode: "TN54" },
  { locationKeywords: ["salem south", "salem s"], rtoCode: "TN90" },
  { locationKeywords: ["sangagiri", "sankari"], rtoCode: "TN52" },
  { locationKeywords: ["mettur"], rtoCode: "TN93" },
  { locationKeywords: ["attur"], rtoCode: "TN77" },
  { locationKeywords: ["vazhapadi"], rtoCode: "TN77Z" },
  { locationKeywords: ["dharmapuri"], rtoCode: "TN29" },
  { locationKeywords: ["palacode"], rtoCode: "TN29W" },
  { locationKeywords: ["harur"], rtoCode: "TN29Z" },

  // THANJAVUR ZONE
  { locationKeywords: ["thanjavur", "tanjore"], rtoCode: "TN49" },
  { locationKeywords: ["pattukottai"], rtoCode: "TN49Y" },
  { locationKeywords: ["kumbakonam"], rtoCode: "TN68" },
  { locationKeywords: ["nagapattinam"], rtoCode: "TN51" },
  { locationKeywords: ["mayiladuthurai"], rtoCode: "TN82" },
  { locationKeywords: ["sirkali", "sirkazhi"], rtoCode: "TN82Z" },
  { locationKeywords: ["tiruvarur", "thiruvarur"], rtoCode: "TN50" },
  { locationKeywords: ["mannarkudi"], rtoCode: "TN50Z" },
  { locationKeywords: ["thiruthuraipoondi"], rtoCode: "TN50Y" },
  { locationKeywords: ["pudukkottai", "pudukottai"], rtoCode: "TN55" },
  { locationKeywords: ["aranthangi"], rtoCode: "TN55Z" },
  { locationKeywords: ["illupur"], rtoCode: "TN55Y" },
  { locationKeywords: ["alangudi"], rtoCode: "TN55BQ" },

  // TIRUCHIRAPALLI ZONE
  { locationKeywords: ["tiruchirapalli west", "trichy west"], rtoCode: "TN45" },
  { locationKeywords: ["manapparai"], rtoCode: "TN45Z" },
  { locationKeywords: ["tiruchirapalli east", "trichy east", "trichy", "tiruchirappalli"], rtoCode: "TN81" },
  { locationKeywords: ["tiruverumbur"], rtoCode: "TN81Z" },
  { locationKeywords: ["srirangam", "sri rangam"], rtoCode: "TN48" },
  { locationKeywords: ["thuraiyur"], rtoCode: "TN48Z" },
  { locationKeywords: ["musuri"], rtoCode: "TN48Y" },
  { locationKeywords: ["lalkudi", "lalgudi"], rtoCode: "TN48X" },
  { locationKeywords: ["karur"], rtoCode: "TN47" },
  { locationKeywords: ["manmangalam"], rtoCode: "TN47X" },
  { locationKeywords: ["kulithalai"], rtoCode: "TN47Z" },
  { locationKeywords: ["aravankurichi"], rtoCode: "TN47Y" },
  { locationKeywords: ["perambalur"], rtoCode: "TN46" },
  { locationKeywords: ["ariyalur"], rtoCode: "TN61" },

  // ERODE ZONE
  { locationKeywords: ["erode east", "erode e"], rtoCode: "TN33" },
  { locationKeywords: ["erode west", "erode w", "erode"], rtoCode: "TN86" },
  { locationKeywords: ["gobi", "gobichettipalayam"], rtoCode: "TN36" },
  { locationKeywords: ["bhavani"], rtoCode: "TN36W" },
  { locationKeywords: ["sathiyamangalam", "sathyamangalam", "satyamangalam", "sathy"], rtoCode: "TN36Z" },
  { locationKeywords: ["perundurai"], rtoCode: "TN56" },
  { locationKeywords: ["namakkal north"], rtoCode: "TN28" },
  { locationKeywords: ["rasipuram"], rtoCode: "TN28Z" },
  { locationKeywords: ["namakkal south", "namakkal"], rtoCode: "TN88" },
  { locationKeywords: ["paramathivelur"], rtoCode: "TN88Z" },
  { locationKeywords: ["thiruchengodu", "tiruchengodu"], rtoCode: "TN34" },
  { locationKeywords: ["kumarapalayam"], rtoCode: "TN34MA" },

  // COIMBATORE ZONE
  { locationKeywords: ["ondipudur", "coimbatore central", "coimbatore c"], rtoCode: "TN66" },
  { locationKeywords: ["gandhipuram", "coimbatore north", "coimbatore n"], rtoCode: "TN38" },
  { locationKeywords: ["coimbatore west", "coimbatore w"], rtoCode: "TN99" },
  { locationKeywords: ["singanallur", "coimbatore south", "coimbatore s", "coimbatore", "kovai"], rtoCode: "TN37" },
  { locationKeywords: ["sulur"], rtoCode: "TN37Z" },
  { locationKeywords: ["pollachi"], rtoCode: "TN41" },
  { locationKeywords: ["valparai", "valpari"], rtoCode: "TN41W" },
  { locationKeywords: ["mettupalayam"], rtoCode: "TN40" },
  { locationKeywords: ["udagamandalam", "ooty"], rtoCode: "TN43" },
  { locationKeywords: ["gudalur"], rtoCode: "TN43Z" },
  { locationKeywords: ["tiruppur north", "tirupur north"], rtoCode: "TN39" },
  { locationKeywords: ["avinashi"], rtoCode: "TN39Z" },
  { locationKeywords: ["tiruppur south", "tirupur south", "tiruppur", "tirupur"], rtoCode: "TN42" },
  { locationKeywords: ["kangayam"], rtoCode: "TN42Y" },
  { locationKeywords: ["dharapuram"], rtoCode: "TN78" },
  { locationKeywords: ["udumalpet", "udumalaipettai"], rtoCode: "TN78MA" },

  // MADURAI ZONE
  { locationKeywords: ["madurai north", "madurai n"], rtoCode: "TN59" },
  { locationKeywords: ["melur"], rtoCode: "TN59Z" },
  { locationKeywords: ["vadipatti"], rtoCode: "TN59V" },
  { locationKeywords: ["madurai south", "madurai s"], rtoCode: "TN58" },
  { locationKeywords: ["tirumangalam", "thirumangalam"], rtoCode: "TN58Z" },
  { locationKeywords: ["usilampatti"], rtoCode: "TN58Y" },
  { locationKeywords: ["madurai central", "madurai c", "madurai"], rtoCode: "TN64" },
  { locationKeywords: ["periyakulam"], rtoCode: "TN60" },
  { locationKeywords: ["uthamapalayam"], rtoCode: "TN60Z" },
  { locationKeywords: ["dindigul"], rtoCode: "TN57" },
  { locationKeywords: ["vedachendur"], rtoCode: "TN57V" },
  { locationKeywords: ["bathalagundu"], rtoCode: "TN57W" },
  { locationKeywords: ["natham"], rtoCode: "TN57BV" },
  { locationKeywords: ["palani"], rtoCode: "TN94" },
  { locationKeywords: ["oddanchattiram", "oddancthatram"], rtoCode: "TN94Z" },

  // VIRUDHUNAGAR ZONE
  { locationKeywords: ["virudhunagar"], rtoCode: "TN67" },
  { locationKeywords: ["aruppukottai"], rtoCode: "TN67W" },
  { locationKeywords: ["srivilliputhur"], rtoCode: "TN84" },
  { locationKeywords: ["sivakasi"], rtoCode: "TN95" },
  { locationKeywords: ["sivagangai", "sivaganga"], rtoCode: "TN63" },
  { locationKeywords: ["karaikudi"], rtoCode: "TN63Z" },
  { locationKeywords: ["ramanathapuram", "ramnad"], rtoCode: "TN65" },
  { locationKeywords: ["paramakudi"], rtoCode: "TN65Z" },

  // TIRUNELVELI ZONE
  { locationKeywords: ["thoothukkudi", "tuticorin"], rtoCode: "TN69" },
  { locationKeywords: ["kovilpatti"], rtoCode: "TN96" },
  { locationKeywords: ["tiruchendur"], rtoCode: "TN92" },
  { locationKeywords: ["tenkasi"], rtoCode: "TN76" },
  { locationKeywords: ["sankaran koil", "sankarankovil"], rtoCode: "TN79" },
  { locationKeywords: ["tirunelveli", "nellai"], rtoCode: "TN72" },
  { locationKeywords: ["valliyur"], rtoCode: "TN72V" },
  { locationKeywords: ["ambasamudram"], rtoCode: "TN76Y" },
  { locationKeywords: ["nagercoil"], rtoCode: "TN74" },
  { locationKeywords: ["marthandam"], rtoCode: "TN75" },

  // GENERAL CHENNAI FALLBACK
  { locationKeywords: ["chennai", "madras"], rtoCode: "TN01" },
];

/**
 * Returns the vehicle registration RTO code (e.g., "tn38", "tn66", "tn39")
 * based on area, district, or location name strings.
 */
export function getTnRtoCodeForLocation(...inputs: (string | null | undefined)[]): string {
  const combined = inputs.filter(Boolean).join(" ").toLowerCase();

  for (const entry of TN_RTO_MAP) {
    for (const kw of entry.locationKeywords) {
      if (combined.includes(kw)) {
        return entry.rtoCode.toLowerCase();
      }
    }
  }

  // Default fallback if no keyword matches (Coimbatore region default)
  return "tn38";
}
