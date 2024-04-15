package com.example.MQTTRestful.automation;

import com.example.MQTTRestful.model.Condition;
import com.example.MQTTRestful.repository.PayloadRepository;
import com.example.MQTTRestful.repository.SensorRepository;
import com.google.gson.Gson;
import jakarta.annotation.Resource;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Stack;

//method 1, inflix to postfix
//method 2, evaluate postfix
@Service
public class postfixEvaluatorHelper {

    private static final Gson gson = new Gson();

    private static int precedence(String s){
        if(s.equals("AND")){
            return 2;
        }
        else if(s.equals("OR")){
            return 1;
        }
        else{
            return 0;
        }
    }

    public static Stack<String> infixToPostfix(ArrayList<String> expression){
        Stack<String> stack = new Stack<>();
        Stack<String> postfix = new Stack<>();
        for(String s : expression){
            if(s.equals("(")){
                stack.push(s);
            }
            else if(s.equals(")")){
                while(!stack.isEmpty() && !stack.peek().equals("(")){
                    postfix.push(stack.pop());
                }
                stack.pop();
            }
            else if(s.equals("AND") || s.equals("OR")){
                while(!stack.isEmpty() && precedence(s) <= precedence(stack.peek())){
                    postfix.push(stack.pop());
                }
                stack.push(s);
            }
            else{
                postfix.push(s);
            }

        }
        while(!stack.isEmpty()){
            postfix.push(stack.pop());
        }
        return postfix;
    }

    public static boolean evaluatePostfix(Stack<String> postfix, String sensorMessage, String topic, SensorRepository sensorRepository, PayloadRepository payloadRepository) {
        boolean isMessageUsed = false;

        Stack<Boolean> stack = new Stack<>();
        for (String s : postfix) {
            if (s.equals("AND")) {
                boolean b1 = stack.pop();
                boolean b2 = stack.pop();
                stack.push(b1 && b2);
            } else if (s.equals("OR")) {
                boolean b1 = stack.pop();
                boolean b2 = stack.pop();
                stack.push(b1 || b2);
            } else {
                //System.out.println("this is condition");
                System.out.println(s + " " + sensorMessage + " " + topic);
                Condition condition = gson.fromJson(s, Condition.class);
                stack.push(condition.evaluate(sensorMessage, topic, sensorRepository, payloadRepository, gson));
                if(!isMessageUsed){
                    isMessageUsed = condition.isMessageUsed(topic,sensorRepository);
                }
            }
        }
        return stack.pop() && isMessageUsed;
    }

}

