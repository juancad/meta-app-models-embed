-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-07-2023 a las 05:10:05
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `metaappmodels`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `applications`
--

CREATE TABLE `applications` (
  `id` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `username` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `title` varchar(1000) NOT NULL,
  `description` varchar(15000) DEFAULT NULL,
  `style` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`style`)),
  `categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`categories`)),
  `useRange` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `applications`
--

INSERT INTO `applications` (`id`, `username`, `title`, `description`, `style`, `categories`, `useRange`) VALUES
('CIFAR-10', 'prueba', '<h2 style=\"text-align:center\">CIFAR-10</h2>', '<p>Fuente: <a href=\"https://colab.research.google.com/github/tensorflow/docs/blob/master/site/en/tutorials/images/cnn.ipynb#scrollTo=qLGkt5qiyz4E\" target=\"_blank\">https://colab.research.google.com/github/tensorflow/docs/blob/master/site/en/tutorials/images/cnn.ipynb#scrollTo=qLGkt5qiyz4E</a></p><p>Dataset: <a href=\"https://www.cs.toronto.edu/~kriz/cifar.html\" target=\"_blank\">https://www.cs.toronto.edu/~kriz/cifar.html</a></p>', '{\"camAlign\":0,\"font\":\"Trebuchet MS\",\"backgroundColor\":\"#373737\",\"textColor\":\"#ffffff\",\"showOutput\":true}', '[{\"name\":\"airplane\",\"minVal\":null,\"maxVal\":null},{\"name\":\"automobile\",\"minVal\":null,\"maxVal\":null},{\"name\":\"bird\",\"minVal\":null,\"maxVal\":null},{\"name\":\"cat\",\"minVal\":null,\"maxVal\":null},{\"name\":\"deer\",\"minVal\":null,\"maxVal\":null},{\"name\":\"dog\",\"minVal\":null,\"maxVal\":null},{\"name\":\"frog\",\"minVal\":null,\"maxVal\":null},{\"name\":\"horse\",\"minVal\":null,\"maxVal\":null},{\"name\":\"ship\",\"minVal\":null,\"maxVal\":null},{\"name\":\"truck\",\"minVal\":null,\"maxVal\":null}]', 0),
('moda', 'prueba', '<h1 style=\"text-align:center\">Moda</h1>', '<p>Fuente: <a href=\"https://www.tensorflow.org/tutorials/keras/classification?hl=es-419\" target=\"_blank\">https://www.tensorflow.org/tutorials/keras/classification?hl=es-419</a></p><p>Dataset: <a href=\"https://github.com/zalandoresearch/fashion-mnist\" target=\"_blank\">https://github.com/zalandoresearch/fashion-mnist</a></p>', '{\"camAlign\":0,\"font\":\"Times New Roman\",\"backgroundColor\":\"#f9edd2\",\"textColor\":\"#000000\",\"showOutput\":true}', '[{\"name\":\"T-shirt\\/top\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Trouser\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Pullover\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Dress\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Coat\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Sandal\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Shirt\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Sneaker\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Bag\",\"minVal\":null,\"maxVal\":null},{\"name\":\"Ankle boot\",\"minVal\":null,\"maxVal\":null}]', 0),
('perros_gatos', 'prueba', '<h2 style=\"text-align:center\"><code><span style=\"color:#000000;\">Perros y gatos</span></code></h2><p style=\"text-align:center\"><code><span style=\"color:#000000;\">Aplciación capaz de identificar perros y gatos.</span></code></p>', '<p style=\"text-align:center\"><code><span style=\"color:#000000;\">Fuente: </span></code><a href=\"https://colab.research.google.com/drive/1DQc8a-WOTctenvoy5T0lWUXn47EuteCy?usp=sharing\" target=\"_blank\"><code><span style=\"color:#000000;\">https://colab.research.google.com/drive/1DQc8a-WOTctenvoy5T0lWUXn47EuteCy?usp=sharing</span></code></a></p>', '{\"camAlign\":0,\"font\":\"Arial\",\"backgroundColor\":\"#e7e7e7\",\"textColor\":\"#353535\",\"showOutput\":true}', '[{\"name\":\"Gato\",\"minVal\":0,\"maxVal\":0.5},{\"name\":\"Perro\",\"minVal\":0.5,\"maxVal\":1}]', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `username` varchar(20) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`username`, `email`, `password`) VALUES
('prueba', 'prueba@gmail.com', '$2y$10$wfCrdNb7ZkCkSqoMogOjpe8seDNHrWJGkJrggOPsBMN36d3PRFGa2');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`username`,`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`username`) REFERENCES `users` (`username`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
