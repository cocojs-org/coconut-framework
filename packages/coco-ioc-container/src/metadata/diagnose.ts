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
}

const DiagnoseCodeMsg = {
  [DiagnoseCode.CO10001]:
    '每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
  [DiagnoseCode.CO10002]: '元数据类 %s 必须有@target装饰器表明装饰目标',
  [DiagnoseCode.CO10003]:
    '在一个类上不能添加多次同一个装饰器，但%s上存在重复装饰器: %s',
  [DiagnoseCode.CO10004]: `%s 类上class装饰器 %s 只能用于装饰%s`,
  [DiagnoseCode.CO10005]: `%s 类 %s 字段上field装饰器 %s 只能用于装饰%s`,
  [DiagnoseCode.CO10006]: `%s 类 %s 方法上method装饰器 %s 只能用于装饰%s`,
  [DiagnoseCode.CO10007]: `业务类 %s 不需要添加@target装饰器`,
  [DiagnoseCode.CO10008]: `%s 类 %s 方法上有@component装饰器，但 %s 没有@configuration类装饰器或@configuration的复合装饰器`,
};

export function createDiagnose(code: DiagnoseCode, ...args: any[]): Diagnose {
  return { code, args };
}

export function printDiagnose(diagnose: Diagnose) {
  console.error(
    `${diagnose.code}：${DiagnoseCodeMsg[diagnose.code]}`,
    ...diagnose.args
  );
}
