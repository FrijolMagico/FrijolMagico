type FundingProject = {
  name: string
  funding: string
  amount: string
  agreementUrl: string
  festivalSlug?: string
}

export const fundingProjects: readonly FundingProject[] = [
  {
    name: 'Aves Migratorias en la región de Coquimbo',
    funding: 'GORE Cultura Regional 2023',
    amount: '$7,247,660.00',
    agreementUrl:
      'https://drive.google.com/file/d/11hyl6UBukbKQyOgPafilA244d0PsswSU/view?usp=sharing'
  },
  {
    name: 'Festival Frijol Magico 2024',
    funding: 'Economias Creativas 2023',
    amount: '$22,996,250.00',
    agreementUrl:
      'https://drive.google.com/file/d/1U5FhezICk3DNHv1ucN0WuIodpGSMmCto/view?usp=sharing',
    festivalSlug: 'frijol-magico-xiii'
  },
  {
    name: 'Festival Frijol Magico "Un nuevo germinar"',
    funding: 'FONDART regional linea festivales 2024',
    amount: '$26,828,894.00',
    agreementUrl:
      'https://drive.google.com/file/d/19nlyDld_o_Q8v5hbXzqCLiZtit8na9WQ/view?usp=sharing',
    festivalSlug: 'frijol-magico-xiv'
  },
  {
    name: 'Novela Grafica Los Perdedores',
    funding: 'GORE Cultura Regional 2024',
    amount: '$9,118,569.00',
    agreementUrl:
      'https://drive.google.com/file/d/1t7tAvAI8YGxtDmPd8UD-6JEy6fMfKjzm/view?usp=sharing'
  },
  {
    name: 'Festival Frijol Mágico 2025',
    funding: 'FONDART regional linea festival trayectoria 2025',
    amount: '$29,625,740.00',
    agreementUrl:
      'https://drive.google.com/file/d/1Rz3gG4PbYf-BhFvpn_IKxU5B_U7_VcLe/view?usp=sharing',
    festivalSlug: 'frijol-magico-xv'
  },
  {
    name: 'Festival Frijol Magico 2026',
    funding: 'Glosa 07 convocatoria 2025',
    amount: '$76,938,750.00',
    agreementUrl:
      'https://drive.google.com/file/d/1Jq84uc7ro_XXSmYpn99Rb2s-RkxiQPPf/view?usp=sharing',
    festivalSlug: 'frijol-magico-xvi'
  }
]
