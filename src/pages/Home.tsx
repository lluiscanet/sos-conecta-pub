import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Users, HandHeart, Map, Car, Home as HomeIcon, ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { StatsSection } from '../components/StatsSection';

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();

  const handleVolunteerClick = () => {
    if (currentUser) {
      navigate('/profile');
    } else {
      navigate('/register');
    }
  };

  const handleAssistanceClick = () => {
    if (currentUser) {
      navigate('/request');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80"
            alt="Volunteers helping"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-red-900/90 mix-blend-multiply" />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in">
            Conectando Comunidades<br />
            <span className="text-red-200">Construyendo Esperanza</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-red-100 animate-fade-in-up">
            Una plataforma para coordinar esfuerzos de ayuda comunitaria y conectar a quienes necesitan apoyo con voluntarios dispuestos a ayudar.
          </p>

          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <button
              onClick={handleVolunteerClick}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50 animate-bounce-in"
            >
              <Users className="h-5 w-5 mr-2" />
              {currentUser ? 'Ir a mi perfil' : 'Ser Voluntario'}
            </button>
            <button
              onClick={handleAssistanceClick}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-500 hover:bg-red-600 animate-bounce-in"
            >
              <HandHeart className="h-5 w-5 mr-2" />
              {currentUser ? 'Solicitar Ayuda' : 'Registrarse para Pedir Ayuda'}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 my-8 mx-auto max-w-7xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">
              Aviso Legal y Consentimiento para Publicación de Datos Personales
            </h3>
            <div className="mt-4 text-sm text-yellow-700 space-y-4">
              <p>
                Al registrarse y proporcionar su información, usted reconoce y acepta que la dirección, email, el número de teléfono y otros datos personales que proporcione serán visibles públicamente en esta plataforma. Estos datos se recopilan únicamente con el propósito de mostrarlos en esta plataforma y facilitar su acceso por parte de otros usuarios.
              </p>
              <div>
                <h4 className="font-medium mb-2">Responsabilidad del Usuario</h4>
                <p>
                  El usuario que envía la información es el único responsable de la veracidad, exactitud y legalidad de los datos proporcionados. sosconecta.org no se responsabiliza por el contenido o la exactitud de la información ingresada por los usuarios.
                </p>
              </div>
              <p className="font-medium">
                Al registrarse, usted confirma que ha leído y comprendido este aviso y consiente expresamente la publicación de los datos proporcionados.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8 mx-auto max-w-7xl">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Esta plataforma es un complemento a los medios oficiales de coordinación de voluntarios y ayuda. 
              En situaciones de emergencia, siempre contacte primero con los servicios de emergencia oficiales.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Características</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Una mejor manera de ayudar
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/assistance" className="relative group">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-1">
                  <HandHeart className="h-8 w-8 text-red-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Solicitudes de Ayuda</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Publica o encuentra solicitudes de ayuda en tu comunidad
                  </p>
                  <ArrowRight className="h-5 w-5 text-red-500 mt-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/volunteers" className="relative group">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-1">
                  <Users className="h-8 w-8 text-red-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Directorio de Voluntarios</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Conecta con voluntarios dispuestos a ayudar en tu área
                  </p>
                  <ArrowRight className="h-5 w-5 text-red-500 mt-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/carpools" className="relative group">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-1">
                  <Car className="h-8 w-8 text-red-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Viajes Compartidos</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Organiza o únete a viajes compartidos para ayudar
                  </p>
                  <ArrowRight className="h-5 w-5 text-red-500 mt-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link to="/housing" className="relative group">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform group-hover:-translate-y-1">
                  <HomeIcon className="h-8 w-8 text-red-500" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Viviendas Temporales</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    Encuentra u ofrece alojamiento temporal
                  </p>
                  <ArrowRight className="h-5 w-5 text-red-500 mt-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <StatsSection />

      {/* Contact Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Contribuye al Proyecto
              </h2>
              <div className="mt-3">
                <p className="text-lg text-gray-500">
                  ¿Quieres ayudar a mejorar esta plataforma? Contáctanos en{' '}
                  <a href="mailto:sos.conecta.help@gmail.com" className="text-red-600 hover:text-red-500">
                    sos.conecta.help@gmail.com
                  </a>
                </p>
              </div>
              <div className="mt-9">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3 text-base text-gray-500">
                    <p>
                      Juntos podemos hacer que esta herramienta sea aún más útil para nuestra comunidad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl mb-4">
              Sobre el Autor
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Esta plataforma fue desarrollada por{' '}
              <a 
                href="https://www.linkedin.com/in/lluiscanet/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-500"
              >
                Lluis Canet
              </a>
              , un ingeniero de IA valenciano residente en Estados Unidos. El proyecto nació como una forma de contribuir 
              a su comunidad natal en Valencia, España, tras las devastadoras inundaciones que afectaron la zona en octubre 
              y noviembre de 2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}