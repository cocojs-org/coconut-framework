export interface Diagnose {
    code: DiagnoseCode;
    args: any[];
}

export enum DiagnoseCode {
    'CO10001' = 'CO10001',
    'CO10002' = 'CO10002', // 元数据类必须要添加@target
    'CO10003' = 'CO10003',
    'CO10004' = 'CO10004',
    'CO10005' = 'CO10005',
    'CO10006' = 'CO10006',
    'CO10007' = 'CO10007', // 业务类不需要添加@target
    'CO10008' = 'CO10008', // 只有配置类内部才可以使用component注入第三方组件。
    'CO10009' = 'CO10009', // autowired注入的类存在多个子类，但是没有使用@qualifier装饰器
    'CO10010' = 'CO10010', // autowired注入的类存在多个子类，但@qualifier装饰器指定了一个不存在的子类id
    'CO10011' = 'CO10011', // 要实例化的类没有注册为ioc组件
    'CO10012' = 'CO10012', // 通过autowired注入的依赖不能是自己
    'CO10013' = 'CO10013', // 实例化过程中发现循环依赖
    'CO10014' = 'CO10014', // 一个元数据类创建了不止一个装饰器
    'CO10015' = 'CO10015', // 元数据类本身存在id属性，且不能修改
    'CO10016' = 'CO10016', // 元数据类没有id属性或者id属性不是字符串
    'CO10017' = 'CO10017', // 元数据类id属性存在重复
    'CO10018' = 'CO10018', // createDecoratorExp的第一个参数不是类，或者不是Metadata的子类
    'CO10019' = 'CO10019', // 装饰器暂时不是支持装饰 setter getter accessor 类型。
    'CO10020' = 'CO10020', // [warn]占位的元数据类没有使用decorateSelf函数，但装饰器也没有被使用
    'CO10021' = 'CO10021', // 占位的元数据类没有使用decorateSelf函数
    'CO10022' = 'CO10022', // 元数据类不能有字段装饰器
    'CO10023' = 'CO10023', // 元数据类不能有方法装饰器
}

const DiagnoseCodeMsg = {
    [DiagnoseCode.CO10001]: '每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
    [DiagnoseCode.CO10002]: '元数据类 %s 必须有@target装饰器表明装饰目标',
    [DiagnoseCode.CO10003]: '在一个类上不能添加多次同一个装饰器，但%s上存在重复装饰器: %s',
    [DiagnoseCode.CO10004]: `%s 类上class装饰器 %s 只能用于装饰%s`,
    [DiagnoseCode.CO10005]: `%s 类 %s 字段上field装饰器 %s 只能用于装饰%s`,
    [DiagnoseCode.CO10006]: `%s 类 %s 方法上method装饰器 %s 只能用于装饰%s`,
    [DiagnoseCode.CO10007]: `业务类 %s 不需要添加@target装饰器`,
    [DiagnoseCode.CO10008]: `%s 类 %s 方法上有@component装饰器，但 %s 没有@configuration类装饰器或@configuration的复合装饰器`,
    [DiagnoseCode.CO10009]: `实例化组件失败，%s 类存在多个子类 %s，但没有使用@qualifier指定子类id`,
    [DiagnoseCode.CO10010]: `实例化组件失败，%s 类存在多个子类 %s，@qualifier装饰器指定了一个不存在的子类id: %s`,
    [DiagnoseCode.CO10011]: `实例化组件失败，%s 类不是ioc组件`,
    [DiagnoseCode.CO10012]: `%s 类 %s 字段不能使用autowired注入自身，字段置为undefined`,
    [DiagnoseCode.CO10013]: `实例化组件失败，%s 类的构造函数的依赖 %s 类也没有完全初始化，可能是循环依赖了？`,
    [DiagnoseCode.CO10014]: `元数据类 %s 创建了不止一个装饰器，每个元数据类只能创建一个对应的装饰器。`,
    [DiagnoseCode.CO10015]: `元数据类 %s 本身存在id属性，且不能被修改。`,
    [DiagnoseCode.CO10016]: `元数据类 %s 没有id属性或者id属性不是字符串，忘记调用assignMetadataId方法？`,
    [DiagnoseCode.CO10017]: `元数据类 %s 和 %s 的id属性相同，id属性不能重复。`,
    [DiagnoseCode.CO10018]: `createDecoratorExp的第一个参数 %s 必须是Metadata的子类。`,
    [DiagnoseCode.CO10019]: `框架暂不支持为 %s 添加装饰器。`,
    [DiagnoseCode.CO10020]: `有一个占位装饰器没有使用decorateSelf关联具体的元数据类，如果不使用的话，直接删除这个装饰器。`,
    [DiagnoseCode.CO10021]: `%s 类存在一个占位装饰器，但是没有使用decorateSelf装饰器关联真正的元数据类。`,
    [DiagnoseCode.CO10022]: `元数据类 %s 只能有 KindClass 类型的装饰器，字段 %s 上的装饰器是无效的，请删除。`,
    [DiagnoseCode.CO10023]: `元数据类 %s 只能有 KindClass 类型的装饰器，方法 %s 上的装饰器是无效的，请删除。`,
};

export function createDiagnose(code: DiagnoseCode, ...args: any[]): Diagnose {
    return { code, args };
}

export function stringifyDiagnose(diagnose: Diagnose) {
    const { code, args } = diagnose;
    const format = DiagnoseCodeMsg[code];
    const msg = format.replace(/%[sd]/g, function (match) {
        const value = args.shift();
        return match === '%d' ? `${parseInt(value, 10)}` : `${String(value)}`;
    });
    return `${diagnose.code}：${msg}`;
}

export function printDiagnose(diagnose: Diagnose) {
    console.error(`${diagnose.code}：${DiagnoseCodeMsg[diagnose.code]}`, ...diagnose.args);
}
