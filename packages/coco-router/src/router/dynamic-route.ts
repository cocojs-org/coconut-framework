class DynamicRoute {
    regExp: RegExp;
    paths: string[]; // pathname通过/拆分而来

    constructor(url: string) {
        if (!url.includes(':')) {
            throw new Error('不包含：，不需要使用正则匹配');
        }

        this.paths = url.split('/');
        const regexParts = this.paths.map((part) => {
            if (part.startsWith(':')) {
                return '(.+)';
            } else {
                return part;
            }
        });
        this.regExp = new RegExp(`^${regexParts.join('\\/')}$`);
    }

    match(url: string) {
        const paths = url.split('/');
        if (paths.length !== this.paths.length) {
            return null;
        }
        const match = this.regExp.exec(url);
        if (match) {
            let params = {};
            let paramIndex = 1;
            this.paths.forEach((part) => {
                if (part.startsWith(':')) {
                    const paramName = part.slice(1);
                    params[paramName] = match[paramIndex++];
                }
            });
            return params;
        }
        return null;
    }
}

export default DynamicRoute;
