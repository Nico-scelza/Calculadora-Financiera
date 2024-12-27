def rentas_valor_final():
    print("Elija la operación que desea calcular: ")
    print("1. Renta Final de Pagos Vencidos")
    print("2. Renta Final de Pagos Adelantados")
    print("3. Intereses Totales")
    print("4. Cálculo del capital en base a un valor final objetivo a una tasa determinada")
    print("5. Cálculo de la tasa de interés necesaria para lograr un valor final objetivo con cuotas constantes")
    while True:
        try:
            pregunta = int(input("Inserte la opción elegida: "))
            if pregunta == 1:
                break
            elif pregunta == 2:
                break
            elif pregunta == 3:
                break
            elif pregunta == 4:
                break
            elif pregunta == 5:
                break
            else:
                print("Por favor, inserte una opción válida")
        except:
            print("Por favor, inserte una opción válida")
    if pregunta == 1:
        while True:
            try:
                pregunta1 = input("¿Hay variación en el capital aportado?: ").lower()
                if pregunta1 == "si":
                    break
                elif pregunta1 == "no":
                    break
                else:
                    print("Por favor, responda por 'si' o por 'no'")
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                pregunta2 = input("¿Hay variación en la tasa?: ").lower()
                if pregunta2 == "si":
                    break
                elif pregunta2 == "no":
                    break
                else:
                    print("Por favor, responda por 'si' o por 'no'")
            except:
                print("Por favor, inserte una opción válida")
        if pregunta1 == "no" and pregunta2 == "no":
            while True:
                try:
                    C = float(input("Inserte el monto del capital que se integra en cada período: "))
                    break
                except:
                    print("Por favor, inserte una opción válida")
            while True:
                try:
                    i1 = float(input("Inserte la tasa de interés: "))
                    i = i1 / 100
                    break
                except:
                    print("Por favor, inserte una opción válida")
            while True:
                try:
                    n = float(input("Inserte la cantidad total de cuotas: "))
                    break
                except:
                    print("Por favor, inserte una opción válida")
            VF = C * ((((1 + i) ** n) - 1) / i)
            return VF
        elif pregunta1 == "si" and pregunta2 == "si":
            while True:
                try:
                    cantidad_capitales = int(input("¿Cuantos capitales distintos se aportan en la renta?: "))
                    if  cantidad_capitales >= 2:
                        break
                    else:
                        print("Por favor, inserte un dato número mayor o igual a 2")
                except:
                    print("Por favor, inserte un dato válido")
            resultados = []
            for j in range(cantidad_capitales):
                C = float(input(f"Inserte el monto de la cuota {j + 1}: "))
                while True:
                    pregunta3 = input("¿Hay un cambio de tasa antes del cambio en el valor de la cuota?: ").lower()
                    if pregunta3 == "si":
                        break
                    elif pregunta3 == "no":
                        break
                    else:
                        print("Por favor, responda por 'si' o por 'no'")
                if pregunta3 == "no":
                    while True:
                        try:    
                            i1 = float(input("Inserte la tasa de interés vigente durante el aporte de las cuotas: "))
                            i = i1 / 100
                            n = int(input("Inserte la cantidad de cuotas: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    resultado_parcial = C * ((((1 + i) ** n) - 1) / i)
                    print("Ahora deberá indicar las tasas posteriores")
                    while True:
                        try:    
                            cantidad_tasas = int(input("Inserte la cantidad de tasas que impactan en el capital aportado luego del último pago de cuota: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    tasas =[]
                    periodos = []
                    for k in range(cantidad_tasas):
                        while True:
                            try:    
                                i1 = float(input(f"Inserte la tasa {k + 1}: "))
                                i = i1 / 100
                                n = int(input("Inserte la cantidad de períodos que faltan para el cambio de tasa o para el fin de la renta: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                        tasas.append(i)
                        periodos.append(n)
                    resultado = resultado_parcial
                    for k in range(cantidad_tasas):
                        resultado *= ((1 + tasas[k]) ** periodos[k])
                    resultados.append(resultado)
                if pregunta3 == "si":
                    resultado_cuota = []
                    while True:
                        try:    
                            cambio_tasas = int(input("Inserte la cantidad de veces que cambia la tasa mientras se pagan las cuotas: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    print("En este caso, para calcular la renta lo que haremos será calcular de forma diferenciada las cuotas con distinta tasa, sin importar que el valor de la cuota sea constante")
                    for k in range(cambio_tasas + 1):
                        while True:
                            try:    
                                i1 = float(input(f"Inserte la tasa de interés {k + 1}: "))
                                i = i1 / 100
                                n = int(input("Inserte la cantidad de cuotas: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                        resultado_parcial = C * ((((1 + i) ** n) - 1) / i)
                        print("Ahora deberá indicar las tasas posteriores")
                        while True:
                            try:    
                                cantidad_tasas = int(input("Inserte la cantidad de tasas que impactan en el capital aportado luego del último pago de cuota: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                        tasas =[]
                        periodos = []
                        for x in range(cantidad_tasas):
                            while True:
                                try:    
                                    i1 = float(input(f"Inserte la tasa {x + 1}: "))
                                    i = i1 / 100
                                    n = int(input("Inserte la cantidad de períodos que faltan para el cambio de tasa o para el fin de la renta: "))
                                    break
                                except:
                                    print("Por favor, inserte un dato válido")
                            tasas.append(i)
                            periodos.append(n)
                        resultado = resultado_parcial
                        for x in range(cantidad_tasas):
                            resultado *= ((1 + tasas[x]) ** periodos[x])
                        resultado_cuota.append(resultado)
                    resultados.append(sum(resultado_cuota))
            return sum(resultados)        
        elif pregunta1 == "no" and pregunta2 == "si": #Varía solo la tasa
            tasas = []
            periodos = []
            while True:
                try:
                    C = float(input(f"Ingrese el monto del cápital: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            while True:
                try:
                    cantidad_tasas = int(input(f"¿Cuantas tasas distintas hay?: "))
                    if  cantidad_tasas >= 2:
                        break
                    else:
                        print("Por favor, inserte un dato número mayor o igual a 2")
                except:
                    print("Por favor, inserte un dato válido")
            for j in range(cantidad_tasas):
                try:
                    i1 = float(input(f"Ingrese la tasa {j + 1}: "))
                    i = i1 / 100
                    tasas.append(i)
                    n = int(input(f"Inserte el período para la tasa {j + 1}: "))
                    periodos.append(n)
                except:
                    print("Por favor, inserte un dato válido")
            tasas_a_capital = []
            for j in range(cantidad_tasas):
                resultado = C * (((1 + tasas[j])**periodos[j]) - 1) / tasas[j]
                tasas_a_capital.append(resultado)
            for j in range(cantidad_tasas):
                for k in range(j + 1, cantidad_tasas):
                    tasas_a_capital[j] *= ((1 + tasas[k])**periodos[k])
            return sum(tasas_a_capital)        
        elif pregunta1 == "si" and pregunta2 == "no": #Varía solo la cuota
            while True:
                try:
                    i1 = float(input("Ingrese la tasa de interes: "))
                    i = i1 / 100
                    break
                except:
                    print("Por favor, inserte un dato válido")
            while True:
                try:
                    cantidad_capitales = int(input("¿Cuantos capitales distintos se aportan en la renta?: "))
                    if  cantidad_capitales >= 2:
                        break
                    else:
                        print("Por favor, inserte un dato número mayor o igual a 2")
                except:
                    print("Por favor, inserte un dato válido")
            resultados = []
            for j in range(cantidad_capitales):
                while True:
                    try:
                        C = float(input(f"Ingrese el monto del cápital número {j + 1}: "))
                        n = int(input(f"Inserte la cantidad de cuotas para el capital {j + 1}: "))
                        h = int(input(f"Inserte la cantidad de períodos que faltan para el final de la renta {j + 1}: "))
                        break
                    except:
                        print("Por favor, inserte un dato válido")
                resultado = (C * ((((1 + i) ** n) - 1) / i)) * ((1 + i) ** h)
                resultados.append(resultado)
            return sum(resultados)
    elif pregunta == 2:
        while True:
            try:
                C = float(input("Inserte el monto del capital que se integra en cada período: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                n = float(input("Inserte la cantidad total de períodos: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        VFA = (C * ((((1 + i) ** n) - 1) / i)) * (1 + i)
        return VFA
    elif pregunta == 3:
        while True:
            try:
                An = float(input("Inserte el valor recibido al final de la renta: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                pregunta = input("¿Varió el valor de la cuota?: ").lower()
                if pregunta == "si":
                    cantidad_capitales = int(input("¿Cuantas veces?: "))
                    break
                elif pregunta == "no":
                    cantidad_capitales = 1
                    break
                else:
                    print("Por favor, responda con 'si' o con 'no'")
            except:
                print("Por favor, inserte un dato válido")
        capitales = []
        periodos = []
        for j in range(cantidad_capitales):
            while True:
                try:
                    C = float(input(f"Inserte el monto del capital {j + 1}: "))
                    n = int(input(f"Inserte la cantidad de cuotas para el capital {j + 1}: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            capitales.append(C)
            periodos.append(n)
        capital_aportado = []
        for j in range(cantidad_capitales):
            capital = capitales[j] * periodos[j]
            capital_aportado.append(capital)
        capital_total = sum(capital_aportado)
        IT = An - capital_total
        return IT
    elif pregunta == 4:
        while True:
            try:
                VF = float(input("Inserte el valor final de la renta: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                n = float(input("Inserte la cantidad total de cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        C = VF * i / ((1 + i)**n - 1)
        return C
    elif pregunta == 5:
        from scipy.optimize import fsolve
        while True:
            try:
                VF = float(input("Inserte el valor final de la renta: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                C = float(input("Inserte el valor de las cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        while True:
            try:
                n = float(input("Inserte la cantidad total de cuotas: "))
                break
            except:
                print("Por favor, inserte una opción válida")
        i = fsolve(lambda i: C * ((1 + i)**n - 1) / i - VF, 0.1)[0]
        return i
    else:
        print("Por favor, inserte una opción válida")