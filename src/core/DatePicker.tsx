import * as React from 'react';
import BaseDatePicker from 'react-date-picker';

export class DatePicker extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {};

    this.onChange = this.onChange.bind(this);
    this.convertToDate = this.convertToDate.bind(this);
  }

  convertToDate(date) {
    if (date && date instanceof Date) {
      return date;
    } else if (date !== undefined) {
      return new Date(date);
    }
  }

  onChange(date) {
    const { onChangeData, name } = this.props;
    onChangeData(name, date);
  }

  render() {
    const {
      minDate,
      maxDate,
      required,
      name,
      locale,
      value,
      className
    } = this.props;

    const start = minDate ? this.convertToDate(minDate) : null;
    const end = maxDate ? this.convertToDate(maxDate) : null;
    const formatedValue = value ? this.convertToDate(value) : null;

    return (
      <BaseDatePicker
        onChange={this.onChange}
        value={formatedValue}
        maxDate={end}
        minDate={start}
        showLeadingZeros={true}
        required={required}
        name={name}
        locale={locale}
        className={className}
      />
    );
  }
}

