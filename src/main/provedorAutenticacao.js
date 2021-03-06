import React from "react";

import AuthService from "../app/service/authService";
import jwt_decode from "jwt-decode";

/**
 * Manda para todos os componentes que o usuario está logado (Só manda para os interessados)
 * Ele usa a api Context do react
 */

/**
 * Cria um objeto do tipo context que representa o proprio contexto
 * React.createContext = Ele recebe um parametro que é um objeto e esse parametro recebe o contexto padrão
 * Assim é possivel inicializar algumas variaveis de contexto padrão
 */
export const AuthContext = React.createContext()
//Passa as propriedades para os interessado (Vai ser usando para passar para os componentes de função)
export const AuthConsumer = AuthContext.Consumer
//Não exporta pois vai ser utilizado só nessa classe
const AuthProvider = AuthContext.Provider

class ProvedorAutenticacao extends React.Component{

    state = {
        usuarioAutenticado: null,
        isAutenticado: false,
        isLoading: true //Vai dizer se estou carregando o provedor de autenticação
    }

    iniciarSessao = (tokenDTO) =>{
        //Pega o token
        const token = tokenDTO.token
        //Pega o claims do token decodificando o token
        const claims = jwt_decode(token)
        //Contruindo um usuario
        const usuario = {
            id: claims.userid,
            nome: claims.nome
        }
    
        AuthService.logar(usuario, token)
        this.setState({isAutenticado:true, usuarioAutenticado: usuario})
    }

    encerrarSessao = () =>{
        AuthService.removerUsuarioAutenticado();
        this.setState({isAutenticado: false, usuarioAutenticado: null})
    }

    //Sempre executado na hora que entra no componente
    componentDidMount(){
        const isAutenticado = AuthService.isUsuarioAutenticado()
        if(isAutenticado){
            const usuario = AuthService.refreshSession()
            this.setState({isAutenticado: true, usuarioAutenticado: usuario})
            this.state.isLoading = false
        }else{
            //Função de callback
            //Quando terminar de carregar a autenticação então é colocado para false o isLoading
            //Colocando assim então vai ser atualizado na hora a variavel
            this.setState(previousState => {
                return{
                    ...previousState,
                    isLoading: false
                }
            })
        }
    }

    render(){

        //Verifica se ainda está sendo carregado a pagina
        //Pois a autenticação ainda está sendo carregada
        if(this.state.isLoading){
            //Então retorna nada
            return null
        }
        //propriedades e os medodos que é para dividir com os filhos/componentes que vai estar dentro de AuthProvider
        const contexto = {
            usuarioAutenticado: this.state.usuarioAutenticado,
            isAutenticado: this.state.isAutenticado,
            iniciarSessao: this.iniciarSessao,
            encerrarSessao: this.encerrarSessao
        }

        return(
            //O AuthProvider tem a propriedade chamada value e nele recebe um objeto com as propriedades e os medodos que é para dividir com os filhos/componentes que vai estar a baixo
            <AuthProvider value={contexto}>
                {/** O Provedor de autenticação vai ter todos os filhos que estão interessados na informação que vai ser passada */}
                {this.props.children}
            </AuthProvider>
        )
    }
}

export default ProvedorAutenticacao