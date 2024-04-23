import React from "react";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.6
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 0px 8px rgb(255, 255, 255)",
    transition: {
      yoyo: Infinity
    }
  }
};
const Login = (props) => {
    return (
        <motion.div 
        className="login-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
          <motion.h1 className="welcome-message">
            Welcome to the decentralized voting application
          </motion.h1>
          <motion.button 
            className="login-button" 
            onClick={props.connectWallet}
            whileHover="hover"
            variants={buttonVariants}
          >
            Login Metamask
          </motion.button>
      </motion.div>    
      )
}

export default Login;