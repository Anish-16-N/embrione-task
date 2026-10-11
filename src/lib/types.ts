// Shared options and the Member type (options come from the challenge PDF).
export const DOMAINS = ['Web Development', 'Design', 'Logistics', 'Operations', 'Sponsorship', 'Hospitality', 'Social Media', 'Event Management']
export const POSITIONS = ['Head', 'Vice-Head', 'Core Member', 'Member']
export const BRANCHES = ['CSE', 'AIML', 'ECE', 'EEE', 'ME', 'Biotech']
export const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

export const BIO_MIN = 150
export const BIO_MAX = 200

export type Member = {
    id: string
    name: string
    domain: string
    position: string
    srn: string
    email: string
    linkedin_url: string | null
    github_url: string | null
    branch: string
    semester: number
    bio: string | null
    photo_url: string
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
}

// Heads first, then Vice-Heads, and so on (used to sort the /team page).
export const POSITION_ORDER: Record<string, number> = {
    Head: 0,
    'Vice-Head': 1,
    'Core Member': 2,
    Member: 3,
}