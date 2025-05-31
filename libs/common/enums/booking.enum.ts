export enum EBookingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  BABY_SITTER_CANCEL = 'babysitter_cancel',
  PARENT_CANCEL = 'parent_cancel',
  COMPLETED = 'completed',
}

export enum ENumOfChildrenCared {
  ONE = 'one',
  TWO = 'two',
  GREATER_OR_EQUAL_THREE = 'greater or equal three',
}

export enum ScheduleType {
  WEEK = 'week',
  MONTH = 'month',
}
