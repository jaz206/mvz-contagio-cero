export interface CharacterImageOption {
    name: string;
    path: string;
    url: string;
}

const GITHUB_OWNER = 'jaz206';
const GITHUB_REPO = 'MisionesMZC';
const GITHUB_BRANCH = 'main';
const VALID_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

const buildCdnUrl = (path: string, versionRef: string) => {
    const encodedPath = path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${versionRef}/${encodedPath}`;
};

const isImagePath = (path: string) => {
    const lowerPath = path.toLowerCase();
    return VALID_IMAGE_EXTENSIONS.some((extension) => lowerPath.endsWith(extension));
};

export const fetchCharacterImageOptions = async (): Promise<CharacterImageOption[]> => {
    const branchResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches/${GITHUB_BRANCH}?ts=${Date.now()}`);

    if (!branchResponse.ok) {
        throw new Error('No se pudo leer la version actual del repositorio de imagenes.');
    }

    const branchData = await branchResponse.json();
    const commitSha = branchData?.commit?.sha;

    if (!commitSha) {
        throw new Error('No se encontro la version mas reciente del repositorio de imagenes.');
    }

    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${commitSha}?recursive=1&ts=${Date.now()}`);

    if (!response.ok) {
        throw new Error('No se pudo leer el repositorio de imagenes.');
    }

    const data = await response.json();
    const tree = Array.isArray(data.tree) ? data.tree : [];

    return tree
        .filter((entry: any) => entry?.type === 'blob' && typeof entry?.path === 'string' && isImagePath(entry.path))
        .map((entry: any) => ({
            name: entry.path.split('/').pop() || entry.path,
            path: entry.path,
            url: buildCdnUrl(entry.path, commitSha)
        }))
        .sort((a: CharacterImageOption, b: CharacterImageOption) => a.path.localeCompare(b.path));
};
