import React from 'react'
import {
  Button, ButtonGroup, ButtonProps, ButtonGroupProps, SxProps, Theme
} from '@mui/material'

type BtnProps = ButtonProps & {
  sx?: SxProps<Theme>
  className?: string
  height?: number
}

type BtnGroupProps = ButtonGroupProps & {
  sx?: SxProps<Theme>
  className?: string
  height?: number
}

export default function Btn(props: BtnProps) {
  const { sx, className, ...rest } = props
  
  return (
    <Button
      className={`custom-btn ${className}`}
      {...rest}
      sx={{ ...sx, borderRadius: '80px', height: props.height, alignItems: 'center' }}
    />
  )
}

export function BtnGroup(props: BtnGroupProps) {
  const { sx, className, ...rest } = props

  return (
    <ButtonGroup
      className={`custom-btn-group ${className}`}
      {...rest}
      sx={{ ...sx, borderRadius: '80px', height: props.height }}
    >
      {props.children}
    </ButtonGroup>
  )
}