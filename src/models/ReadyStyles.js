export const flex = {
  // Base configurations
  base: {
    display: 'flex'
  },
  row: {
    display: 'flex',
    flexDirection: 'row'
  },
  column: {
    display: 'flex',
    flexDirection: 'column'
  },
  one: {
    flex: 1
  },
  half: {
    flex: 0.5
  },

  // Row variations
  rowCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowBetween: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rrowBetween: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowAround: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  rowEvenly: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  rowStart: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  rowEnd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  rowStretch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch'
  },

  // Column variations
  columnCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  columnBetween: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  columnAround: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  columnEvenly: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly'
  },
  columnStart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  columnEnd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end'
  },
  columnStretch: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },

  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alignCenter: {
    display: 'flex',
    alignItems: 'center'
  },
  justifyCenter: {
    display: 'flex',
    justifyContent: 'center'
  },
  alignStart: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  alignEnd: {
    display: 'flex',
    alignItems: 'flex-end'
  },
  justifyStart: {
    display: 'flex',
    justifyContent: 'flex-start'
  },
  justifyEnd: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  justifyBetween: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  justifyAround: {
    display: 'flex',
    justifyContent: 'space-around'
  },
  justifyEvenly: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },

};

export const height = {
  auto: {
    height: 'auto'
  },
  full: {
    height: '100%'
  },
  screen: {
    height: '100vh'
  },
  half: {
    height: '50%'
  },
  quarter: {
    height: '25%'
  }
};

export const width = {
  auto: {
    width: 'auto'
  },
  full: {
    width: '100%'
  },
  screen: {
    width: '100vw'
  },
  half: {
    width: '50%'
  },
  quarter: {
    width: '25%'
  }
};

export const background ={
  overlay: {
    backgroundColor: 'background.overlay'
  }
}

export const size ={
  full: {
    width: '100%',
    height: '100%',
  },
  half: {
    width: '50%',
    height: '50%',
  }
}

export const gap ={
  ten: {
    gap: '10px'
  },
  five: {
    gap: '5px'
  },
  fifteen: {
    gap: '15px'
  }
}