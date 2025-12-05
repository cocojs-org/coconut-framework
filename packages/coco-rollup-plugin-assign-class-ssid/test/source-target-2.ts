function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {}
    }
}

@logged
class Btn {
    count: number;
    render() {};
}
export default Btn;