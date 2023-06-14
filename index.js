const canvas = document.querySelector('canvas')

// 2. Associando o contexto 2D
const c = canvas.getContext('2d')

// 31. Fazendo o elemento do Score para atualizar automaticamente
const scoreEl = document.querySelector('#scoreEl')


// 3. Pegando a largura da tela inteira
canvas.width = innerWidth

// 4. Pegando a altura da tela inteira
canvas.height = innerHeight

// 5. Definindo os limites do mapa
class Boundary {
    // 10. Variáveis para controlar expessura da borda
    static width = 40
    static height = 40

    constructor({position, image}) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    // 6. Desenhando e estilizando os limites
    draw() {
        // c.fillStyle = 'blue'
        // c.fillRect(this.position.x, this.position.y, this.width, this.height)

        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

// 11. Adicionando o Pacman
class Player {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        // Tamanho do Pacman
        this.radius = 15

        // 50. animação da boca do pacman
        this.radians = 0.75
        this.openRate = 0.12

        // 54. Fazendo o Pacman rodar para a direção que for
        this.rotation = 0
    }

    draw() {
        // 52. Fazendo o Pacman rodar para a direção que for
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)


        c.beginPath()
        // c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)

        // 49. Fazendo o Pacman abrir e fechar a boca
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)

        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()

        // 53. Fazendo o Pacman rodar para a direção que for
        c.restore()
    }

    // 15. Atualizando a movimentação sempre que a tecla for pressionada
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // 51. Animação abrindo e fechando a boca do pacman
        if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate

        this.radians += this.openRate
    }
}

// 33. Criando os fantasmas
class Ghost {
    // 36. Criando a variável de velocidade do fantasma
    static speed = 2

    constructor({ position, velocity, color = 'red' }) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'cyan' : this.color
        c.fill()
        c.closePath()
    }

    // 15. Atualizando a movimentação sempre que a tecla for pressionada
    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

// 26. Adicionando a comida do Pacman
class Pellet {
    constructor({ position }) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

// 40. Adicionando poderes ao Pacman
class PowerUp {
    constructor({ position }) {
        this.position = position
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

// 27. Criando o Pellet
const pellets = []

// 6. Criando os limites
const boundaries = []

// 41. Criando o power up (fruta que dá poderes)
const powerUps = []

// 34. Criando o fantasmas
const ghosts = [
    new Ghost ({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost ({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    })
]

// 12. Criando o Pacman
const player = new Player({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})

// 18. Verificando a tecla pressionada, para manter o movimento
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

// 21. Saber qual foi a última tecla pressionada
let lastKey = ''

// 32. Definindo o SCORE
let score = 0


// 8. Criando o mapa
const map = [
    // - -> bloco horizontal
    // | -> bloco vertical
    // b -> bloco
    // 1 -> canto superior esquerdo
    // 2 -> canto superior direito
    // 3 -> canto inferior direito
    // 4 -> canto inferior esquerdo
    // . -> comida
    // p -> power up
    // ...
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

// 26. Função para gerar as imagens
function createImage(src) {
    // 25. Criando variável para as imagens
    const image = new Image()
    image.src = src
    return image
}

// 9. Desenhando cada linha do mapa
map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeHorizontal.png')
          })
        )
        break
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeVertical.png')
          })
        )
        break
      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner1.png')
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('./img/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('./img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('./img/pipeConnectorLeft.png')
          })
        )
        break
        case '.':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              }
            })
          )
          break
        case 'p':
          powerUps.push(
            new PowerUp({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              }
            })
          )
          break
        }
    })
})

// 24. Reduzindo 22. a uma função (colidindo com o limite do mapa)
function circleCollidesWithRectangle({
    circle,
    rectangle

}) {

    //37. Arrumando o código de colisão para quando alterar speed
    const padding = Boundary.width / 2 - circle.radius - 1

    return (
        circle.position.y - circle.radius + circle.velocity.y <=
            rectangle.position.y + rectangle.height + padding &&
        circle.position.x + circle.radius + circle.velocity.x >=
            rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >=
            rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <=
            rectangle.position.x + rectangle.width + padding)
}

// 38. Mensagem de final de jogo (pausando toda a animação)
let animationId


// 15. Criando um loop na animação
function animate() {
    animationId = requestAnimationFrame(animate)
    // 16. Limpar o canvas assim que chamar o animate
    c.clearRect(0, 0, canvas.width, canvas.height)

    // 19. Atualizando os valores da tecla pressionada
        // O lastKey funciona para trocar o sentido sem da prioridade a outras teclas
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({
                circle: {
                    ...player,
                    velocity: {
                        x: 0,
                        y: -5
                    }
                },
                rectangle: boundary
            })
            ) {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -5
            }
        }

        } else if (keys.a.pressed && lastKey === 'a') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: -5,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
                ) {
                    player.velocity.x = 0
                    break
                } else {
                    player.velocity.x = -5
                }
            }
        } else if (keys.s.pressed && lastKey === 's') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: 0,
                            y: 5
                        }
                    },
                    rectangle: boundary
                })
                ) {
                    player.velocity.y = 0
                    break
                } else {
                    player.velocity.y = 5
                }
            }
        } else if (keys.d.pressed && lastKey === 'd') {
            for (let i = 0; i < boundaries.length; i++) {
                const boundary = boundaries[i]
                if (circleCollidesWithRectangle({
                    circle: {
                        ...player,
                        velocity: {
                            x: 5,
                            y: 0
                        }
                    },
                    rectangle: boundary
                })
                ) {
                    player.velocity.x = 0
                    break
                } else {
                    player.velocity.x = 5
                }
            }
        }        

    // 46. Detectando colisão entre fantasma e Pacman
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]
        // 47. Fantasma toca o Pacman
        if (Math.hypot(ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
        ) < ghost.radius + player.radius
        ) {

            if (ghost.scared){
                ghosts.splice(i, 1)

                score += 100
                scoreEl.innerHTML = score
            } else {
                cancelAnimationFrame(animationId)
                console.log('Você perdeu! :(')
            }
        }
    }

    // 48. Condição de vitória
    if (pellets.length === 0) {
        console.log('VOCÊ VENCEU!!! 🥳')
    }

    // 42. Fazendo o Power Up aparecer
    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        // 43. Colisão do pacman com o power Up
        if (Math.hypot(powerUp.position.x - player.position.x,
            powerUp.position.y - player.position.y
            ) < 
            powerUp.radius + player.radius
        ){
            powerUps.splice(i, 1)

            score += 30
            scoreEl.innerHTML = score

            // 44. Fazer os fantasmas ficarem com medo
            ghosts.forEach(ghost => {
                ghost.scared = true
                console.log('Os fantasmas estão com medinho')

                setTimeout(() => {
                    ghost.scared = false
                    console.log('O medo foi embora')
                }, 6000)
            })
        }
    }


    // 30.
    for (let i = pellets.length - 1; 0 <= i; i--) {
        // 28.
        // pellets.forEach((pellet, i) => {

        const pellet = pellets[i]
        
        pellet.draw()

        // 29. Colisão do pacman com a comida
        if (Math.hypot(pellet.position.x - player.position.x,
            pellet.position.y - player.position.y) < pellet.radius
            + player.radius) {
                pellets.splice(i, 1)

                // 32.
                score += 10
                scoreEl.innerHTML = score
            }
    }
    
    // })

    // 7. Chamando a função draw para os limites
    boundaries.forEach((boundary) => {
        boundary.draw()

        // 22. Adicionando a colisão com o limite do mapa
        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
        ) {
        // console.log('We are colliding')

        // 23. Fazendo o Pacman parar assim que colidir
        player.velocity.x = 0
        player.velocity.y = 0

        }
    })
    
    // 13. Desenhando o Pacman
    player.update()

    // 20. Zerando o valor da direção
    // player.velocity.x = 0
    // player.velocity.y = 0

    // 33.
    ghosts.forEach(ghost => {
        ghost.update()

        // 45. Toque do fantasma
        // 39. Colisao do pacman com o fantasma
        if (Math.hypot(ghost.position.x - player.position.x,
            ghost.position.y - player.position.y
            ) < ghost.radius + player.radius && !ghost.scared
            ) {
                cancelAnimationFrame(animationId)
                console.log('Você perdeu! :(')
            }

        // 34. Colisão dos fantasmas com a parede
        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost,
                    velocity: {
                        x: ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                collisions.push('right')
            }

            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost,
                    velocity: {
                        x: -ghost.speed,
                        y: 0
                    }
                },
                rectangle: boundary
            })
            ) {
                collisions.push('left')
            }

            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost,
                    velocity: {
                        x: 0,
                        y: -ghost.speed
                    }
                },
                rectangle: boundary
            })
            ) {
                collisions.push('up')
            }

            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                circle: {
                    ...ghost,
                    velocity: {
                        x: 0,
                        y: ghost.speed
                    }
                },
                rectangle: boundary
            })
            ) {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')

            const pathways = ghost.prevCollisions.filter((collision) => {
                return !collisions.includes(collision)
            })

            // 35. Direção aleatória para o fantasma
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break

                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break

                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }
        // console.log(collisions)
    })
    
    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5

} // Fim da animação

animate()

// 14. Criando a movimentação do Pacman
addEventListener('keydown', ({key}) => { // pegando apenas a propriedade 'key' do evento
    switch (key) {
        case 'w':
            // player.velocity.y = -5
            keys.w.pressed = true
            lastKey = 'w' // 21
            break
        case 'a':
            // player.velocity.x = -5
            keys.a.pressed = true
            lastKey = 'a' // 21
            break
        case 's':
            // player.velocity.y = 5
            keys.s.pressed = true
            lastKey = 's' // 21
            break
        case 'd':
            // player.velocity.x = 5
            keys.d.pressed = true
            lastKey = 'd' // 21
            break
    }

    // console.log(player.velocity)
})

// 17. Fazendo o Pacman andar em linha reta, ao invés da diagonal
addEventListener('keyup', ({key}) => { // pegando apenas a propriedade 'key' do evento
    switch (key) {
        case 'w':
            // player.velocity.y = 0
            keys.w.pressed = false
            break
        case 'a':
            // player.velocity.x = 0
            keys.a.pressed = false
            break
        case 's':
            // player.velocity.y = 0
            keys.s.pressed = false
            break
        case 'd':
            // player.velocity.x = 0
            keys.d.pressed = false
            break
    }

    // console.log(player.velocity)
})