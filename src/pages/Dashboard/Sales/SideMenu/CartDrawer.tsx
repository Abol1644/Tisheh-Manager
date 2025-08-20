import React from 'react'

import {
  Box,
  Accordion, AccordionActions, AccordionSummary, AccordionDetails,
  Typography,
  Button,
  Slide,
} from '@mui/material'

import Btn from '@/components/elements/Btn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { ListCart } from '@/models';

const users = [
  {
    id: 1,
    name: 'یازرلو'
  },
  {
    id: 2,
    name: 'آرین'
  },
  {
    id: 3,
    name: 'مهرداد'
  },
  {
    id: 4,
    name: 'رضا'
  },
  {
    id: 5,
    name: 'محمدی'
  },
  {
    id: 6,
    name: 'پیام'
  },
]

const orders = [
  {
    userId: 1,
    orderNum: '8',
    orderer: 'خانم قاسمی',
    orderDate: '1402/01/01'
  },
  {
    userId: 1,
    orderNum: '9',
    orderer: 'خانم قاسمی',
    orderDate: '1402/01/03'
  },
  {
    userId: 1,
    orderNum: '10',
    orderer: 'خانم قاسمی',
    orderDate: '1402/01/04'
  },
  {
    userId: 2,
    orderNum: '5',
    orderer: 'ماهان',
    orderDate: '1402/01/01'
  },
  {
    userId: 3,
    orderNum: '2',
    orderer: 'شانه زرد',
    orderDate: '1402/01/03'
  },
  {
    userId: 4,
    orderNum: '10',
    orderer: 'خانم قاسمی',
    orderDate: '1402/01/04'
  },
  {
    userId: 5,
    orderNum: '5',
    orderer: 'ماهان',
    orderDate: '1402/01/01'
  },
  {
    userId: 6,
    orderNum: '2',
    orderer: 'شانه زرد',
    orderDate: '1402/01/03'
  },
]

export function CartDrawer({
  setOpenCart,
  openCart,
  value,
  drawerOpen,
  listCart = [],
}: {
  setOpenCart: (value: boolean) => void;
  openCart: boolean;
  drawerOpen: boolean;
  value: number;
  listCart: ListCart[];
},) {

  const getUserOrders = (userId: number) => {
    return orders.filter(order => order.userId === userId);
  }

  const handleOrderClick = () => {
    if (openCart === false) {
      setOpenCart(!openCart);
    }
  };

  return (
    <h1>hi</h1>
    // <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
    //   {listCart.map((cart, index) => {
    //     const userOrders = getUserOrders(cart.id);

    //     return (
    //       <React.Fragment key={cart.id}>
    //         <Slide
    //           direction="up"
    //           in={value === 0 && drawerOpen === true}
    //           mountOnEnter
    //           unmountOnExit
    //           timeout={300}
    //           style={{
    //             transitionDelay: `${index * 100}ms`,
    //           }}
    //         >
    //           <Accordion key={cart.id}>

    //             <AccordionSummary
    //               expandIcon={<ExpandMoreIcon />}
    //               aria-controls={`panel${cart.id}-content`}
    //               id={`panel${cart.id}-header`}
    //             >
    //               <Typography component="span">
    //                 {cart.name} ({userOrders.length})
    //               </Typography>
    //             </AccordionSummary>

    //             <AccordionDetails>
    //               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    //                 {userOrders.length > 0 ? (
    //                   userOrders.map((order) => (
    //                     <Btn
    //                       key={`${order.userId}-${order.orderNum}`}
    //                       variant="outlined"
    //                       sx={{
    //                         justifyContent: 'flex-start',
    //                         textAlign: 'right',
    //                       }}
    //                       onClick={handleOrderClick}
    //                     >
    //                       سبد شماره {order.orderNum} - {order.orderer} - {order.orderDate}
    //                     </Btn>
    //                   ))
    //                 ) : (
    //                   <Typography variant="body2" color="text.secondary">
    //                     هیچ سفارشی یافت نشد
    //                   </Typography>
    //                 )}
    //               </Box>
    //             </AccordionDetails>
    //           </Accordion>
    //         </Slide>
    //       </React.Fragment>
    //     );
    //   })}
    // </Box >

  );
}

