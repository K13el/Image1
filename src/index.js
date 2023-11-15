import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';

import { Camera } from 'expo-camera';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const DetectObject = () => {
    const [imageUri, setImageUri] = useState(null); 
    const [labels, setLabels] = useState([]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4,3],
                quality: 1,
            })

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
                setLabels([]);
            }
            console.log(result);
        } catch (error) {
            console.error('Error Picking Image: ', error);
        }
    }

    const analyzeImage = async () => {
        try {
            if (!imageUri) {
                alert('Please Select an Image First!');
                return;
            }

            const apiKey = "AIzaSyBryoRVrtvRrH-yd_tqQ4VdDHnIOIUx9-w"
            const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

            const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const requestData = {
                requests: [
                    {
                        image: {
                            content: base64ImageData,
                        },
                        features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
                    },
                ],
            };
            
            const apiResponse = await axios.post(apiURL, requestData);
            setLabels(apiResponse.data.responses[0].labelAnnotations);
        } catch(error) {
            console.error('Error Analyzing Image: ', error);
            alert('Error Analyzing Image. Please Try Again Later');
        }
    };

    const resetImageAndLabels = () => {
        setImageUri(null);
        setLabels([]);
    };

    return ( 
        <View style={styles.container}>
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: 300, height: 300 }}
                />
            )}

            <TouchableOpacity
                onPress={pickImage}
                style={styles.button}
            >
                <Text style={styles.text}>Choose an Image...</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={analyzeImage}
                style={styles.button}
            >
                <Text style={styles.text}>Analyze Image.</Text>
            </TouchableOpacity>

            {
                labels.length > 0 && (
                    <View style={styles.labelContainer}>
                        <Text style={styles.label}>Labels:</Text>
                        <View style={styles.labelsBox}>
                            {
                                labels.map((label, index) => (
                                    <Text
                                        key={index}
                                        style={styles.outputtext}
                                    >
                                        {label.description}
                                    </Text>
                                ))
                            }
                        </View>
                        <TouchableOpacity
                            onPress={resetImageAndLabels}
                            style={styles.resetButton}
                        >
                            <Text style={styles.resetText}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                )
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title:{
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 50,
        margin: 100,
    },
    button: {
        backgroundColor: '#DDDDDD',
        padding:10,
        marginBottom: 10,
        marginTop: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    label: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
    },
    outputtext: {
        fontSize: 18,
        marginBottom: 18,
    },
    resetButton: {
        marginTop: 10,
        backgroundColor: 'red',
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    resetText: {
        color: 'white',
        fontWeight: 'bold',
    },
    labelContainer: {
        alignItems: 'center',
    },
    labelsBox: {
        marginTop: 10,
    },
});

export default DetectObject;