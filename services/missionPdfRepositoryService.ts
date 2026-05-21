export interface MissionPdfOption {
    name: string;
    path: string;
    url: string;
}

const GITHUB_OWNER = 'jaz206';
const GITHUB_REPO = 'MisionesMZC';
const GITHUB_BRANCH = 'main';

const buildCdnUrl = (path: string) => {
    const encodedPath = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${encodedPath}`;
};

export const fetchMissionPdfOptions = async (): Promise<MissionPdfOption[]> => {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`);

    if (!response.ok) {
        throw new Error('No se pudo leer el repositorio de PDFs.');
    }

    const data = await response.json();
    const tree = Array.isArray(data.tree) ? data.tree : [];

    return tree
        .filter((entry: any) => entry?.type === 'blob' && typeof entry?.path === 'string' && entry.path.toLowerCase().endsWith('.pdf'))
        .map((entry: any) => ({
            name: entry.path.split('/').pop() || entry.path,
            path: entry.path,
            url: buildCdnUrl(entry.path),
        }))
        .sort((a: MissionPdfOption, b: MissionPdfOption) => a.path.localeCompare(b.path));
};
