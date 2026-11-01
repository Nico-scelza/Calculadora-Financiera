def regimen_simple():
    print("Elija la operación que desea calcular: ")
    print("Monto Final = M")
    print("Interés Total = I")
    print("Capital Invertido = C")
    print("Tasa de Interés = Y")
    print("Valor Descontado = VD")
    print("Valor Actual = VA")
    print("Descuento Total = D")
    print("Resultado Financiero = RF")
    while True:
        pregunta = input("Inserte la opción elegida: ").lower()
        if pregunta == "i":
            break
        elif pregunta == "m":
            break
        elif pregunta == "c":
            break
        elif pregunta == "y":
            break
        elif pregunta == "vd":
            break
        elif pregunta == "va":
            break
        elif pregunta == "d":
            break
        elif pregunta == "rf":
            break
        else:
            print("Por favor, inserte una respuesta válida")
    if pregunta == "i":
        while True:
            try:    
                C = float(input("Inserte el capital invertido: "))
                M = float(input("Inserte el monto recibido: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        Interés_total = M - C
        return Interés_total
    elif pregunta == "m":
        while True:
            try:    
                C = float(input("Inserte el capital invertido: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        while True:            
            cambio_tasa = input("¿Hay un cambio de tasa en el medio?: ").lower()
            capitalizacion = input("¿Hay capitalización?: ").lower()
            if cambio_tasa == "si" and capitalizacion == "si":
                break
            elif cambio_tasa == "no" and capitalizacion == "si":
                break
            elif cambio_tasa == "si" and capitalizacion == "no":
                break
            elif cambio_tasa == "no" and capitalizacion == "no":
                break
            else:
                print("Por favor, responda con 'si' o con 'no'")
        if cambio_tasa == "si" and capitalizacion == "si":
            def pre_capitalizacion():
                tasas = []
                periodos = []
                intereses = []
                while True:
                    try:
                        cantidad = int(input("¿Cuántas tasas hay antes de la capitalización?: "))
                        break
                    except:
                        print("Por favor, inserte un dato válido")
                for i in range(cantidad):
                    while True:
                        try:
                            tasa1 = float(input(f"Inserte la tasa {i+1}: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    tasa = tasa1 / 100
                    tasas.append(tasa)
                for i in range(cantidad):
                    while True:
                        try:
                            n = float(input(f"Inserte la cantidad de períodos para la tasa {i+1}: "))
                            periodos.append(n)
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                for i in range(cantidad):
                    interes = C * (tasas[i] * periodos [i])
                    intereses.append(interes)
                monto_antes_capitalizacion = C + sum(intereses)
                return monto_antes_capitalizacion
            while True:
                try:
                    cant_cap = int(input("¿Cuántas veces se capitaliza la operación?: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            print("Primero vamos a calcular el monto previo a la capitalización")
            monto_inicial = pre_capitalizacion()
            capitalizaciones = []
            capitalizaciones.append(monto_inicial)
            print("Ahora vamos a calcular las capitalizaciones")
            for i in range(cant_cap):
                while True:
                    pregunta = input(f"¿Hay cambio de tasa en la capitalización {i+1}: ").lower()
                    if pregunta == "si":
                        break
                    elif pregunta == "no":
                        break
                    else:
                        print("Por favor, responda por 'si' o por 'no'")
                if pregunta == "si":
                    tasas = []
                    periodos = []
                    intereses = []
                    while True:
                        try:
                            num_tasas = int(input("¿Cuántas tasas hay?: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    for j in range(num_tasas):
                        while True:
                            try:
                                tasa1 = float(input(f"Inserte la tasa {j+1}: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                        tasa = tasa1 / 100
                        tasas.append(tasa)
                    for j in range(num_tasas):
                        while True:
                            try:
                                n = float(input(f"Inserte la cantidad de períodos para la tasa {j+1}: "))
                                periodos.append(n)
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                    for j in range(num_tasas):
                        interes = capitalizaciones[i] * (tasas[j] * periodos [j])
                        intereses.append(interes)
                    monto = capitalizaciones[i] + sum(intereses)
                    capitalizaciones.append(monto)
                else:
                    while True:        
                        try:    
                            tasa1 = float(input(f"Inserte la tasa de la operación: ")) 
                            tasa = tasa1 / 100
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    while True:
                            try:
                                n = float(input(f"Inserte la cantidad de períodos para la operación"))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                    interes = capitalizaciones[i] * (tasa * n)
                    monto = capitalizaciones[i] + interes
                    capitalizaciones.append(monto)
            return capitalizaciones[-1]
        elif cambio_tasa == "si" and capitalizacion == "no":
            tasas = []
            periodos = []
            intereses = []
            while True:
                try:
                    cantidad = int(input("¿Cuántas tasas hay?: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            for i in range(cantidad):
                while True:
                    try:
                        tasa1 = float(input(f"Inserte la tasa {i+1}: "))
                        break
                    except:
                        print("Por favor, inserte un dato válido")
                tasa = tasa1 / 100
                tasas.append(tasa)
            for i in range(cantidad):
                while True:
                    try:
                        n = float(input(f"Inserte la cantidad de períodos para la tasa {i+1}: "))
                        periodos.append(n)
                        break
                    except:
                        print("Por favor, inserte un dato válido")
            for i in range(cantidad):
                interes = C * (tasas[i] * periodos [i])
                intereses.append(interes)
            monto = C + sum(intereses)
            return monto
        elif cambio_tasa == "no" and capitalizacion == "si":
            while True:
                try:
                    i1 = float(input("Inserte el porcentaje de interés: "))
                    i = i1/100
                    n = float(input("Inserte la cantidad de períodos: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            monto_inicial = C * (1 + i * n)
            capitalizaciones = []
            capitalizaciones.append(monto_inicial)
            print("Ahora vamos a calcular las capitalizaciones")
            while True:
                try:
                    cant_cap = int(input("¿Cuántas veces se capitaliza la operación?: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            for i in range(cant_cap):
                while True:
                    pregunta = input(f"¿Hay cambio de tasa en la capitalización {i+1}: ").lower()
                    if pregunta == "si":
                        break
                    elif pregunta == "no":
                        break
                    else:
                        print("Por favor, responda por 'si' o por 'no'")
                if pregunta == "si":
                    tasas = []
                    periodos = []
                    intereses = []
                    while True:
                        try:
                            num_tasas = int(input("¿Cuántas tasas hay?: "))
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    for j in range(num_tasas):
                        while True:
                            try:
                                tasa1 = float(input(f"Inserte la tasa {j+1}: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                        tasa = tasa1 / 100
                        tasas.append(tasa)
                    for j in range(num_tasas):
                        while True:
                            try:
                                n = float(input(f"Inserte la cantidad de períodos para la tasa {j+1}: "))
                                periodos.append(n)
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                    for j in range(num_tasas):
                        interes = capitalizaciones[i] * (tasas[j] * periodos [j])
                        intereses.append(interes)
                    monto = capitalizaciones[i] + sum(intereses)
                    capitalizaciones.append(monto)
                else:
                    while True:        
                        try:    
                            tasa1 = float(input(f"Inserte la tasa de la operación: ")) 
                            tasa = tasa1 / 100
                            break
                        except:
                            print("Por favor, inserte un dato válido")
                    while True:
                            try:
                                n = float(input(f"Inserte la cantidad de períodos para la operación: "))
                                break
                            except:
                                print("Por favor, inserte un dato válido")
                    interes = capitalizaciones[i] * (tasa * n)
                    monto = capitalizaciones[i] + interes
                    capitalizaciones.append(monto)
            return capitalizaciones[-1]
        else:
            while True:
                try:
                    i1 = float(input("Inserte el porcentaje de interés: "))
                    i = i1/100
                    n = float(input("Inserte la cantidad de períodos: "))
                    break
                except:
                    print("Por favor, inserte un dato válido")
            monto = C * (1 + i * n)
            return monto 
    elif pregunta == "c":
        while True:
            try:
                M = float(input("Inserte el monto recibido al final de la operación: "))
                i1 = float(input("Inserte el porcentaje de interés: "))
                i = i1/100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        Capital = M / (1 + i * n)
        return Capital
    elif pregunta == "y":
        while True:
            try:
                M = float(input("Inserte el monto recibido al final de la operación: "))
                C = float(input("Inserte el capital invertido: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        interés = ((M / C) - 1) * 100
        return interés
    elif pregunta == "vd":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                d1 = float(input("Inserte la tasa de descuento: "))
                d = d1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        valor_descontado = N * (1 - d * n)
        return valor_descontado
    elif pregunta == "va":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                i1 = float(input("Inserte la tasa de interés: "))
                i = i1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        valor_actual = N / (1 + i * n)
        return valor_actual
    elif pregunta == "d":
        while True:
            try:
                N = float(input("Inserte el valor nominal: "))
                d1 = float(input("Inserte la tasa de descuento: "))
                d = d1 / 100
                n = float(input("Inserte la cantidad de períodos: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        descuento = N * d * n
        return descuento
    elif pregunta == "rf":
        while True:
            try:
                VD = float(input("Inserte el valor descontado de la operación: "))
                Vi = float(input("Inserte el valor original de la operación: "))
                break
            except:
                print("Por favor, inserte un dato válido")
        RF = VD - Vi
        return RF
    else:
        print("Por favor, inserte una opción válida")