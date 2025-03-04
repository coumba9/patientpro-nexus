
export interface DoctorInfo {
  name: string;
  specialty: string;
  fees: {
    consultation: number;
    followup: number;
    urgent: number;
  };
  languages: string[];
  experience: string;
  education: string;
  conventions: string;
}

export const getDefaultDoctorInfo = (doctorName: string | null, specialty: string | null): DoctorInfo => {
  return {
    name: doctorName || "Dr. Non spécifié",
    specialty: specialty || "Non spécifié",
    fees: {
      consultation: 25000,
      followup: 15000,
      urgent: 35000,
    },
    languages: ["Français", "Anglais"],
    experience: "15 ans",
    education: "Faculté de Médecine de Paris",
    conventions: "Secteur 1 - Conventionné",
  };
};
